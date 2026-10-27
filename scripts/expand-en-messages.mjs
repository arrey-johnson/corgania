import fs from "fs";

const path = new URL("../messages/en.json", import.meta.url);
const en = JSON.parse(fs.readFileSync(path, "utf8"));

Object.assign(en.common, {
  saved: "Saved",
  somethingWrong: "Something went wrong.",
  membersOnly: "Members only",
  applyMembership: "Apply for membership",
  viewCategory: "View category →",
  toggleMenu: "Toggle menu",
  homeAria: "Home",
  nothingYet: "Nothing here yet — by design",
  seriesLoaded: "Series loaded from {source}.",
  insightsFallback: "Insights",
  buyerRole: "Buyer",
  sellerRole: "Seller",
});

en.footer.insightsBrand = "Insights";

Object.assign(en.auth, {
  pageLogin: "Login",
  pageRegister: "Become a Member",
  pageForgot: "Forgot Password",
});

en.categories = {
  "cocoa-coffee-tea": {
    name: "Cocoa, Coffee & Tea",
    blurb: "Beans, liquor, butter and specialty lots from West & Central African producers.",
  },
  "grains-cereals": {
    name: "Grains & Cereals",
    blurb: "Maize, rice, sorghum, millet and milled products for bulk buyers.",
  },
  "oilseeds-edible-oils": {
    name: "Oilseeds & Edible Oils",
    blurb: "Groundnuts, sesame, soy, palm and shea supply chains.",
  },
  "fruits-vegetables": {
    name: "Fruits & Vegetables",
    blurb: "Fresh and processed produce meeting export phytosanitary standards.",
  },
  "spices-ingredients": {
    name: "Spices & Ingredients",
    blurb: "Pepper, ginger, vanilla and natural ingredients, traceable to origin.",
  },
  "timber-wood": {
    name: "Timber & Wood Products",
    blurb: "Legally harvested, certified sawn timber and finished wood goods.",
  },
  "textiles-cotton": {
    name: "Cotton & Textiles",
    blurb: "Raw cotton, yarn, fabric and garments from African mills.",
  },
  "minerals-metals": {
    name: "Minerals & Metals",
    blurb: "Responsibly sourced industrial minerals with full documentation.",
  },
};

en.regions = {
  europe: "Europe",
  northAmerica: "North America",
  asia: "Asia",
  middleEast: "Middle East",
};

en.markets = {
  title: "African Markets",
  eyebrow: "Markets",
  hero: "African markets, opened in phases.",
  lead:
    "Country profiles are published only when locally verified supply and sourcing data exists for that market. We would rather show one real market than twenty invented ones.",
  launchActive: "Launch market · Active",
  viewProfile: "View market profile →",
  buyerRegions: "Buyer regions",
  whereBuyers: "Where our buyers source",
  qualifiedIn: "Qualified bulk buyers in {region}",
  moreMarkets:
    "Additional African supply markets are announced here as verification operations open in each country.",
  profileEyebrow: "Market Profile",
  cameroonBody:
    "Cameroon is Corgania's launch market: the first country where seller verification, inspection operations and marketplace onboarding are active. Approved Cameroonian producers, manufacturers, exporters and wholesalers trade with qualified international buyers through verified storefronts.",
  supplyCategories: "Supply categories in this market",
  liveNote:
    "Live, member-level supply and pricing are visible only inside the approved-member marketplace. Public commodity intelligence for this market will appear on the commodities desk once a licensed data source is connected, with full source attribution.",
  commoditiesLink: "commodities desk",
  launchName: "Cameroon",
  launchNote:
    "Corgania's launch market. Additional African markets are onboarded in phases as verification capacity is established — country profiles are published only when locally verified supply data exists.",
  profileTitle: "{country} Market Profile",
};

en.products = {
  title: "Products & Industries",
  eyebrow: "Products & Industries",
  hero: "African supply, organised for bulk buyers.",
  lead: "Public pages describe categories. Live listings, pricing and supplier contact live inside the members-only marketplace.",
  categoryEyebrow: "Product Category",
  categoryBody:
    "Verified member suppliers in this category publish full specifications, minimum order quantities, bulk pricing tiers, lead times and delivery terms inside the marketplace. Supplier profiles disclose the exact scope and status of their Corgania Verify assessment.",
  applyOrExplore: "to browse live listings, or",
  exploreMarkets: "explore the markets",
  shipsFrom: "this category ships from.",
};

en.commodities = {
  title: "Commodities",
  eyebrow: "Commodities Desk",
  hero: "Benchmark prices, honestly sourced.",
  lead: "Each series will show source, unit, currency, period and last-updated date.",
  feedPending: "Licensed price feed not yet connected",
  dataPending: "Data pending",
  viewSeries: "View series",
  noData: "No licensed data available yet",
  benchmark: "Benchmark series",
  sourceLine: "Source: {source} · {unit} · {currency} · Updated {updatedAt}",
  commodityEyebrow: "Commodity",
  chartAria: "Commodity price history chart",
  cocoa: "Cocoa",
  coffee: "Coffee",
  cotton: "Cotton",
  timber: "Sawn Timber",
  unitTonne: "USD / metric tonne",
  unitKg: "USD / kg",
  unitM3: "USD / m³",
  pricesTitle: "{name} Prices",
  reasonUnavailable:
    "A licensed market-data provider is not connected yet. Corgania never invents benchmark prices.",
  reasonUnknown: "No series is configured for this commodity yet.",
};

en.insightsPage = {
  title: "Insights — News & Analysis",
  eyebrow: "Insights",
  hero: "News & analysis on African trade.",
  lead: "Written by our editorial team, published from the Corgania CMS.",
  emptyTitle: "No articles published yet",
  emptyText:
    "Editorial content will appear here as soon as the first pieces are published. We do not display placeholder stories.",
  fallback: "Insights",
  articleEyebrow: "Insight",
};

en.tradeOpportunities = {
  title: "Trade Opportunities",
  eyebrow: "Trade Opportunities",
  hero: "Buyer demand meets verified African supply.",
  lead: "Open sourcing requests are visible in full only to approved members, so suppliers negotiate with qualified counterparties — not the open internet.",
  body: "International buyers publish structured Requests for Quotation specifying product, specification, quantity, destination, delivery window and quotation deadline. Eligible verified suppliers respond with priced quotations; buyers compare, negotiate and accept — and only an accepted quotation becomes an order.",
  buyerMembership: "Buyer membership",
  sellerMembership: "Seller membership",
};

en.contact = {
  title: "Contact",
  eyebrow: "Contact",
  hero: "Talk to the Corgania team.",
  lead: "Membership, verification, partnerships and press enquiries.",
  fullName: "Full name",
  workEmail: "Work email",
  company: "Company (optional)",
  message: "Message",
  send: "Send enquiry",
  formError: "Please check the form.",
  thanks:
    "Thanks — our contact mailbox integration is being connected. Please also reach the team via your member account once registered, and your enquiry details were validated successfully.",
};

Object.assign(en.membership, {
  sellersTitle: "Membership for Sellers",
  sellersEyebrow: "For African Sellers",
  sellersHero: "Your products. The world's buyers.",
  sellersLead:
    "Join as a producer, manufacturer, exporter or wholesaler and sell to qualified international bulk buyers.",
  sellersWhatTitle: "What you get",
  sellersWhat:
    "A branded storefront with your catalogue, bulk pricing tiers and certifications; access to buyer RFQs matched to your categories; direct messaging with buyers; and Trade Services support for documentation, inspection and shipment milestones.",
  sellersVerifyTitle: "What verification requires",
  sellersVerify:
    "Registered business name and country, registration details, legal address, authorised representative, business activities, relevant licences and supporting documents. Physical inspection may be required. Document upload or fee payment alone never approves an application — an independent approver makes the final decision.",
  sellersCta: "Start your seller application",
  buyersTitle: "Membership for Buyers",
  buyersEyebrow: "For International Buyers",
  buyersHero: "Source from Africa, with evidence.",
  buyersLead:
    "Every supplier on Corgania has passed registration, document and — where required — premises verification.",
  buyersWhatTitle: "What you get",
  buyersWhat:
    "Search verified suppliers by country, industry and minimum order quantity; issue structured RFQs to eligible sellers; compare quotations side by side; negotiate in-platform; and manage orders through documented milestones to delivery.",
  buyersVerifyTitle: "Buyer verification",
  buyersVerify:
    "Buyers complete a risk-appropriate checklist confirming company registration, authorised representatives and sourcing intent. Supplier profiles always disclose the scope and status of their assessment, so you know exactly what has — and has not — been checked.",
  buyersCta: "Start your buyer application",
  sellersCard:
    "Producers, manufacturers, exporters and wholesalers: branded storefront, product catalogue, RFQ access and Trade Services support.",
  buyersCard:
    "Bulk buyers and procurement teams: verified supplier search, structured RFQs, quotation comparison and documented order execution.",
});

Object.assign(en.onboarding, {
  hubHeading: "Complete your membership application",
  hubIntro:
    "Choose your application path. Corgania Verify reviews every organisation before marketplace access is granted.",
  createOrg: "Create your organisation",
  createOrgHelp:
    "Registration alone does not create a trading organisation. Add your legal entity to continue.",
  organisation: "Organisation",
  viewStatus: "View status",
  sellerApp: "Seller application",
  sellerAppHelp: "Business registration, licences, documents and inspection readiness.",
  buyerApp: "Buyer application",
  buyerAppHelp: "Company verification and authorised-representative checklist.",
  statusCard: "Application status",
  statusCardHelp: "Track review, information requests and your approval decision.",
  back: "← Onboarding",
  createFirst: "Create organisation first",
  updateResubmit: "Update & resubmit",
  appDetails: "Application details",
  verifyDocs: "Verification documents",
  sellerOnFile: "Your seller application is on file. Track progress on the status page.",
  buyerOnFile: "Your buyer application is on file. Track progress on the status page.",
  infoRequired: "Corgania Verify requested more information. Update your details and resubmit.",
  uploadForCase: "Upload supporting files for case {id}",
  noOrg: "No organisation yet",
  marketplaceAccess: "Marketplace access",
  progress: "Verification progress",
  intended: "Intended capabilities",
  submitted: "Submitted",
  decision: "Decision:",
  openApp: "Open {kind} application",
  canBuy: "Buy",
  canSell: "Sell",
  restricted:
    "This area is restricted to approved member organisations. If you have applied, your verification status determines access — registration alone does not grant trading access.",
  supabaseNeeded:
    "This area requires the Supabase backend, which is not configured in this environment yet.",
  legalName: "Legal name",
  tradingName: "Trading name (optional)",
  country: "Country of registration",
  intent: "Primary intent",
  submitOrg: "Create organisation",
  industry: "Industry / commodity focus",
  industryPh: "e.g. Cocoa, coffee, timber",
  description: "Business description",
  descriptionPh: "Describe your operations, capacity and export readiness.",
  productsOffered: "Products offered",
  exportExperience: "Export experience",
  annualCapacity: "Annual capacity (optional)",
  website: "Website (optional)",
  certifications: "Certifications (optional)",
  submitSeller: "Submit seller application",
  submitBuyer: "Submit buyer application",
  sourcingRegions: "Sourcing regions of interest",
  annualVolume: "Indicative annual volume (optional)",
  fileLabel: "File (PDF, JPEG, PNG or WebP · max 20 MB)",
  docType: "Document type",
  uploadDoc: "Upload document",
  docBusinessReg: "Business registration certificate",
  docTax: "Tax / TIN certificate",
  docExport: "Export licence (if applicable)",
  docQuality: "Quality / certification evidence",
  docCompanyReg: "Company registration",
  docRep: "Authorised representative proof",
  docTradeRef: "Trade reference or bank letter",
});

Object.assign(en.marketplace, {
  intro:
    "Approved-member wholesale trading. Product and supplier data load live from Supabase — a suspended seller's listings stop being tradeable automatically.",
  browseProducts: "Browse products",
  browseProductsHelp: "Search by category, country, MOQ and pricing mode.",
  rfqTitle: "Requests for Quotation",
  rfqHelp: "Publish sourcing requests and compare supplier quotations.",
  emptyCatalogue: "Catalogue activates with approved sellers",
  emptyCatalogueText:
    "Listings appear here once seller storefronts are approved and products pass moderation. No placeholder products are shown.",
  productsTitle: "Products",
  productsEmpty: "No products listed yet",
  suppliersTitle: "Verified suppliers",
  suppliersEmpty: "No supplier storefronts yet",
  rfqsTitle: "Requests for Quotation",
  rfqsEmpty: "No RFQs yet",
  listingUnavailable: "Listing unavailable",
  listingUnavailableText: "This product listing is not available.",
  storeUnavailable: "Storefront unavailable",
  storeUnavailableText: "This supplier storefront is not available.",
  rfqUnavailable: "RFQ unavailable",
  rfqUnavailableText: "This request for quotation is not available.",
  buyerDash: "Buyer dashboard",
  sellerDash: "Seller dashboard",
  messagesTitle: "Messages",
  ordersTitle: "Orders",
  settingsTitle: "Settings",
  placeholderBody: "This workspace activates when live trading data is available for your organisation.",
});

fs.writeFileSync(path, `${JSON.stringify(en, null, 2)}\n`);
console.log("Expanded en.json");
