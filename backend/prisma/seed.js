"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const defaultScopeBullets = [
    "Protect landscaping, set safety perimeter, and conduct pre-job walkthrough.",
    "Remove existing roof covering down to the deck; inspect substrate; photo-document conditions.",
    "Replace damaged decking as authorized; re-nail existing decking to code where required.",
    "Install synthetic underlayment and leak barriers per plan; new metal drip and rake edges.",
    "Replace or fabricate flashings at penetrations, valleys, walls, and transitions; apply sealants as specified.",
    "Provide balanced attic ventilation per code/manufacturer; verify intake and exhaust.",
    "Follow manufacturer details for exposure, fastener type/count and layout; comply with local code.",
    "Daily cleanup and magnetic nail sweep; debris haul-off; final QA checklist with photos."
];
const defaultDisclaimer = "This estimate is provided in good faith based on the information available at the time of preparation. This is not a contract. Final pricing and scope of work are subject to change pending an in-person inspection to verify conditions and identify any underlying structural issues, code requirements, or unforeseen circumstances that may require additional work. Any changes to the scope or price will be communicated and approved before work commences.";
const products = [
    {
        name: "GAF Timberline HDZ (50-Year System Warranty)",
        description: "Flagship asphalt shingle roof with full Gold Pledge coverage.",
        unitPrice: 500,
        warrantyText: "GAF Gold Pledge Warranty: lifetime materials (50 years non-prorated), 25-year workmanship, 15-year wind warranty, algae resistance, and includes tear-off & disposal.",
        scopeIntro: "Install the full GAF Timberline HDZ roof system with qualifying components for Gold Pledge coverage.",
        componentBullets: [
            "Use qualifying GAF components (Timberline HDZ shingles, starter, ridge caps, leak barriers, synthetic underlayment).",
            "Install Timberline HDZ shingles per GAF details with the LayerLock nailing zone and 6 nails per shingle."
        ],
        scopeBullets: [
            "Install qualifying GAF components for full system coverage.",
            "Timberline HDZ shingles installed following manufacturer requirements."
        ],
        tags: ["asphalt", "gaf", "residential"]
    },
    {
        name: "Owens Corning Duration (Platinum Preferred Warranty)",
        description: "Owens Corning Duration shingle roof with Platinum warranty coverage.",
        unitPrice: 500,
        warrantyText: "Owens Corning Platinum Warranty: 50-year coverage on materials, labor, tear-off & disposal with 25-year workmanship protection, plus wind and algae protection.",
        scopeIntro: "Install the complete Owens Corning system required for Platinum Preferred coverage.",
        componentBullets: [
            "Use qualifying Owens Corning components.",
            "Install Duration shingles per OC specifications with SureNail fastening."
        ],
        scopeBullets: [
            "Install qualifying Owens Corning components for full system coverage.",
            "Duration shingles installed per OC specifications."
        ],
        tags: ["asphalt", "owens-corning", "premium"]
    },
    {
        name: "Standing Seam",
        description: "Concealed-fastener standing seam metal roofing system.",
        unitPrice: 1350,
        warrantyText: "Manufacturer panel and paint warranties apply; includes lifetime workmanship warranty from Zuppardo’s.",
        scopeIntro: "Fabricate and install a premium standing seam metal roofing system with concealed fasteners.",
        componentBullets: [
            "Concealed-fastener standing-seam panels with clips & underlayment.",
            "Fabricate flashings, closures & sealants at perimeters & penetrations."
        ],
        scopeBullets: [
            "Install concealed-fastener standing-seam panels with approved clips/fasteners and hemmed eaves.",
            "Fabricate edge, wall, valley & ridge flashings with closures; allow for thermal movement."
        ],
        tags: ["metal", "standing-seam"]
    },
    {
        name: "Unified Steel Granite Ridge (Stone-Coated Steel)",
        description: "Granite Ridge stone-coated steel roof system.",
        unitPrice: 1400,
        warrantyText: "Unified Steel Granite Ridge Warranty: 50-year property-based coverage with 20-year manufacturer workmanship; includes Zuppardo’s lifetime workmanship warranty.",
        scopeIntro: "Install Unified Steel Granite Ridge stone-coated panels per manufacturer specs.",
        componentBullets: [
            "Granite Ridge panels with trims & accessories.",
            "Underlayment, flashings, fasteners & ventilation per manufacturer."
        ],
        scopeBullets: [
            "Install Granite Ridge panels following manufacturer’s fastener schedule & coursing.",
            "Use approved trims, foam closures & accessories for sealed, wind-resistant assembly."
        ],
        tags: ["metal", "stone-coated"]
    },
    {
        name: "R-Panel Metal Roofing",
        description: "Exposed-fastener R-panel system with lifetime workmanship warranty.",
        unitPrice: 700,
        warrantyText: "Manufacturer material & paint warranties apply; includes Zuppardo’s lifetime workmanship warranty.",
        scopeIntro: "Install exposed-fastener R-panels with new underlayment, flashings, and sealants.",
        componentBullets: [
            "Exposed-fastener R-panel with closures & sealants.",
            "Underlayment and flashings at all perimeters & penetrations."
        ],
        scopeBullets: [
            "Install exposed-fastener R-panels with specified fastener spacing & laps.",
            "Seal sidelaps & endlaps with sealant and closures at eaves, ridges & penetrations."
        ],
        tags: ["metal", "r-panel", "value"]
    },
    {
        name: "Other",
        description: "Placeholder for custom or specialty systems.",
        unitPrice: 0,
        warrantyText: "As specified; manufacturer warranties apply.",
        scopeIntro: "Custom roofing scope to be defined per project.",
        componentBullets: ["As specified"],
        scopeBullets: [],
        tags: ["custom"]
    }
];
const slugify = (value) => value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
async function upsertDefaults() {
    for (const product of products) {
        await prisma.product.upsert({
            where: { slug: slugify(product.name) },
            update: {
                ...product,
                slug: slugify(product.name),
                scopeBullets: product.scopeBullets,
                componentBullets: product.componentBullets,
                tags: product.tags,
                isApproved: true,
            },
            create: {
                ...product,
                slug: slugify(product.name),
                scopeBullets: product.scopeBullets,
                componentBullets: product.componentBullets,
                tags: product.tags,
                isApproved: true,
            },
        });
    }
    await prisma.setting.upsert({
        where: { key: "defaultScopeBullets" },
        update: { value: defaultScopeBullets },
        create: { key: "defaultScopeBullets", value: defaultScopeBullets },
    });
    await prisma.setting.upsert({
        where: { key: "defaultDisclaimer" },
        update: { value: defaultDisclaimer },
        create: { key: "defaultDisclaimer", value: defaultDisclaimer },
    });
}
async function main() {
    await upsertDefaults();
    console.log("Seed data synced.");
}
main()
    .catch((err) => {
    console.error(err);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map