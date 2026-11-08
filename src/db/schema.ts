/**
 * Esquema do banco (PostgreSQL + Drizzle).
 *
 * Multi-tenant: todo registro de negócio carrega `tenant_id`.
 * A TuManera é o tenant principal (kind = 'principal'); cada collab é um tenant filho.
 * O isolamento é garantido no banco por Row Level Security (ver drizzle/rls.sql).
 *
 * Fase 0/1: tenancy, catálogo, personalização, pedidos, CRM/WhatsApp.
 * Fase 2+: estoque, compras, produção, fiscal, financeiro (tabelas já esboçadas aqui
 * quando afetam o desenho das tabelas da Fase 1).
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  index,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const tenantId = () =>
  uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" });

/* ───────────── Tenancy ───────────── */

export const tenantKind = pgEnum("tenant_kind", ["principal", "collab"]);
export const memberRole = pgEnum("member_role", ["owner", "admin", "atendimento", "producao", "collab"]);

export const tenants = pgTable("tenants", {
  id: id(),
  kind: tenantKind("kind").notNull().default("collab"),
  slug: text("slug").notNull().unique(), // subdomínio: slug.tumanera.com.br
  name: text("name").notNull(),
  parentId: uuid("parent_id"), // collab -> TuManera
  theme: jsonb("theme").$type<{ logoUrl?: string; primary?: string; accent?: string }>().default({}),
  commissionPct: numeric("commission_pct", { precision: 5, scale: 2 }).default("0"),
  paymentRecipientId: text("payment_recipient_id"), // id do recebedor no split (Mercado Pago/Pagar.me)
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

export const users = pgTable("users", {
  id: id(), // = auth.users.id do Supabase
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  createdAt: createdAt(),
});

export const memberships = pgTable(
  "memberships",
  {
    tenantId: tenantId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRole("role").notNull(),
  },
  (t) => [primaryKey({ columns: [t.tenantId, t.userId] })],
);

/* ───────────── Catálogo ───────────── */

export const productLine = pgEnum("product_line", [
  "peca_pronta", // NF-e
  "dtf_metro", // NFS-e
  "personalizacao_peca_cliente", // NFS-e
]);

export const products = pgTable(
  "products",
  {
    id: id(),
    tenantId: tenantId(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    line: productLine("line").notNull().default("peca_pronta"),
    description: text("description"),
    basePriceCents: integer("base_price_cents").notNull().default(0),
    ncm: text("ncm"), // fiscal (Fase 2)
    serviceCode: text("service_code"), // LC 116 (Fase 2)
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("products_tenant_slug").on(t.tenantId, t.slug)],
);

export const productVariants = pgTable("product_variants", {
  id: id(),
  tenantId: tenantId(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  color: text("color").notNull(),
  size: text("size").notNull(),
  sku: text("sku"),
  blankSupplierSku: text("blank_supplier_sku"), // peça lisa da confecção
});

export const printAreas = pgTable("print_areas", {
  id: id(),
  tenantId: tenantId(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  code: text("code").notNull(), // peito, costas, manga...
  label: text("label").notNull(),
  allowedSizes: text("allowed_sizes").array().notNull(), // escudo, a4, a3
  side: text("side").notNull().default("frente"),
  x: integer("x").notNull(), // % no mockup
  y: integer("y").notNull(),
});

/* ───────────── Personalização ───────────── */

export const customizationStatus = pgEnum("customization_status", [
  "rascunho",
  "enviado",
  "em_revisao",
  "proposta_enviada",
  "aprovado",
  "recusado",
]);

export const artworks = pgTable("artworks", {
  id: id(),
  tenantId: tenantId(),
  contactId: uuid("contact_id").references(() => contacts.id),
  storagePath: text("storage_path").notNull(),
  widthPx: integer("width_px"),
  heightPx: integer("height_px"),
  dpiAtTarget: integer("dpi_at_target"), // validação: >= 300
  hasTransparency: boolean("has_transparency"),
  createdAt: createdAt(),
});

export const customizationRequests = pgTable("customization_requests", {
  id: id(),
  tenantId: tenantId(),
  contactId: uuid("contact_id").references(() => contacts.id),
  conversationId: uuid("conversation_id").references(() => conversations.id),
  productId: uuid("product_id").references(() => products.id),
  customerSupplied: boolean("customer_supplied").notNull().default(false),
  quantity: integer("quantity").notNull().default(1),
  // [{ areaCode, size, artworkId, offsetX, offsetY, scale }]
  placements: jsonb("placements").notNull().default([]),
  quotedCents: integer("quoted_cents"),
  status: customizationStatus("status").notNull().default("rascunho"),
  createdAt: createdAt(),
});

export const proposals = pgTable("proposals", {
  id: id(),
  tenantId: tenantId(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => customizationRequests.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  mockupPath: text("mockup_path"),
  totalCents: integer("total_cents").notNull(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: createdAt(),
});

/* ───────────── CRM + WhatsApp ───────────── */

export const contacts = pgTable(
  "contacts",
  {
    id: id(),
    tenantId: tenantId(),
    name: text("name"),
    whatsapp: text("whatsapp"), // E.164
    email: text("email"),
    document: text("document"), // CPF/CNPJ para nota
    tags: text("tags").array().default([]),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("contacts_tenant_whatsapp").on(t.tenantId, t.whatsapp)],
);

export const conversationStatus = pgEnum("conversation_status", ["bot", "humano", "encerrada"]);

export const conversations = pgTable("conversations", {
  id: id(),
  tenantId: tenantId(),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  channel: text("channel").notNull().default("whatsapp"),
  status: conversationStatus("status").notNull().default("bot"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const messages = pgTable(
  "messages",
  {
    id: id(),
    tenantId: tenantId(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    direction: text("direction").notNull(), // in | out
    author: text("author").notNull(), // cliente | bot | atendente
    body: text("body"),
    mediaPath: text("media_path"),
    providerMessageId: text("provider_message_id"), // id da Meta
    createdAt: createdAt(),
  },
  (t) => [index("messages_conversation").on(t.conversationId, t.createdAt)],
);

export const dealStage = pgEnum("deal_stage", [
  "novo",
  "qualificado",
  "arte",
  "proposta",
  "pago",
  "producao",
  "entregue",
  "perdido",
]);

export const deals = pgTable("deals", {
  id: id(),
  tenantId: tenantId(),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  stage: dealStage("stage").notNull().default("novo"),
  valueCents: integer("value_cents"),
  createdAt: createdAt(),
});

/* ───────────── Pedidos ───────────── */

export const orderStatus = pgEnum("order_status", [
  "aguardando_pagamento",
  "pago",
  "em_producao",
  "enviado",
  "entregue",
  "cancelado",
]);

export const orders = pgTable("orders", {
  id: id(),
  tenantId: tenantId(), // a loja onde a venda aconteceu (TuManera ou collab)
  number: integer("number").generatedAlwaysAsIdentity(),
  contactId: uuid("contact_id").references(() => contacts.id),
  dealId: uuid("deal_id").references(() => deals.id),
  status: orderStatus("status").notNull().default("aguardando_pagamento"),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  paymentProvider: text("payment_provider"),
  paymentId: text("payment_id"),
  createdAt: createdAt(),
});

export const orderItems = pgTable("order_items", {
  id: id(),
  tenantId: tenantId(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  line: productLine("line").notNull(), // define NF-e x NFS-e
  productVariantId: uuid("product_variant_id").references(() => productVariants.id),
  customizationRequestId: uuid("customization_request_id").references(() => customizationRequests.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitCents: integer("unit_cents").notNull(),
});

/* ───────────── Fiscal (Fase 2, esboço) ───────────── */

export const fiscalDocuments = pgTable("fiscal_documents", {
  id: id(),
  tenantId: tenantId(),
  orderId: uuid("order_id").references(() => orders.id),
  kind: text("kind").notNull(), // nfe | nfse
  provider: text("provider").notNull(), // focus_nfe | nfe_io
  providerRef: text("provider_ref"),
  status: text("status").notNull().default("pendente"), // pendente | autorizada | rejeitada | cancelada
  number: text("number"),
  xmlPath: text("xml_path"),
  pdfPath: text("pdf_path"),
  createdAt: createdAt(),
});
