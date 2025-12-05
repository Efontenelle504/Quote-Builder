import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const defaultScopeBullets: string[] = [
  "Protect landscaping, set safety perimeter, and conduct pre-job walkthrough.",
  "Remove existing roof covering down to the deck; inspect substrate; photo-document conditions.",
  "Replace damaged decking as authorized; re-nail existing decking to code where required.",
  "Install synthetic underlayment and leak barriers per plan; new metal drip and rake edges.",
  "Replace or fabricate flashings at penetrations, valleys, walls, and transitions; apply sealants as specified.",
  "Provide balanced attic ventilation per code/manufacturer; verify intake and exhaust.",
  "Follow manufacturer details for exposure, fastener type/count and layout; comply with local code.",
  "Daily cleanup and magnetic nail sweep; debris haul-off; final QA checklist with photos."
];

const defaultDisclaimer =
  "This estimate is provided in good faith based on the information available at the time of preparation. This is not a contract. Final pricing and scope of work are subject to change pending an in-person inspection to verify conditions and identify any underlying structural issues, code requirements, or unforeseen circumstances that may require additional work. Any changes to the scope or price will be communicated and approved before work commences.";

const defaultBranding = {
  companyName: "Zuppardo's Renovations LLC",
  address: "4405 Senac Drive, Metairie, LA 70003",
  phone: "(504) 493-7777",
  website: "https://zuppardosrenovations.com",
  logoUrl: "https://zuppardosrenovations.com/wp-content/uploads/2024/11/64ee5a67dae52024c3e16f6a_ZR-Official-Logo-2-p-500.png",
  primaryColor: "#b11226",
  secondaryColor: "#0a0a0a"
};

const salesReps = [
  { name: "Ross Heffner", phone: "+15042857707", email: "" },
  { name: "Eric Fontenelle", phone: "+15042857707", email: "eric@zuppardosrenovations.com" },
  { name: "John Zuppardo", phone: "+15042857707", email: "john@zuppardosrenovations.com" },
  { name: "Sam Capeliano", phone: "+5044600830", email: "sam@zuppardosrenovations.com" },
  { name: "Brandon Muller", phone: "+15042311881", email: "brandon@zuppardosrenovations.com" },
  { name: "James Tillman", phone: "+15046156084", email: "james@zuppardosrenovations.com" },
  { name: "Terry Garwood", phone: "+15042810591", email: "tgarwood07@gmail.com" }
];

const products: Array<{
  name: string;
  category?: string;
  description?: string;
  unitPrice?: number;
  warrantyText?: string;
  scopeIntro?: string;
  scopeBullets?: string[];
  componentBullets?: string[];
  tags: string[];
  imageUrl?: string;
  isCustom?: boolean;
  isApproved?: boolean;
}> = [
  {
    name: "Zuppardo’s Special – Atlas ProLam (Non-FORTIFIED)",
    category: "Roofing",
    description: "Zuppardo’s Special non-fortified Atlas ProLam shingle roofing system.",
    unitPrice: 0,
    warrantyText: "2-year material warranty and 2-year workmanship warranty from Zuppardo’s Renovations.",
    scopeIntro: "Install the Zuppardo’s Special Atlas ProLam shingle roofing system covering {{TOTAL_SQUARES}} squares.",
    scopeBullets: [
      "Demo and remove all shingles and underlayment down to the bare decking.",
      "Perform a thorough inspection of the decking; replace the first two sheets at no charge and obtain signed change orders for any additional repairs.",
      "Furnish and install an architectural asphalt shingle roofing system across {{TOTAL_SQUARES}} squares.",
      "Remove all trash and debris from the property using our dump trailer.",
      "Magnet sweep the property for nails, screws, and fasteners.",
      "Complete all cleaning to the owner’s satisfaction."
    ],
    componentBullets: [
      "Ice and water shield in valleys and around jacks, pipes, and chimneys.",
      "Synthetic underlayment on the entire roof (Jefferson and Orleans Parish receive a double layer per parish standard).",
      "New 26-gauge drip edge flashing on the entire roof.",
      "New starters and new 3-in-1 roof jacks.",
      "Atlas ProLam architectural shingles.",
      "New ventilation (whirly birds, ridge vents, or power vents) with Atlas ventilation components.",
      "Atlas Pro-Cut Hip & Ridge™ caps."
    ],
    tags: ["roof", "asphalt", "atlas", "non-fortified"]
  },
  {
    name: "Atlas Pinnacle Pristine Designer (Non-FORTIFIED)",
    category: "Roofing",
    description: "Non-fortified Atlas Pinnacle Pristine Designer shingle roofing system.",
    unitPrice: 0,
    warrantyText: "Limited lifetime material warranty from Atlas Roofing and 5-year workmanship warranty from Zuppardo’s Renovations.",
    scopeIntro: "Install a non-fortified Atlas Pinnacle Pristine Designer shingle roofing system covering {{TOTAL_SQUARES}} squares.",
    scopeBullets: [
      "Demo and remove all shingles and underlayment down to the bare decking.",
      "Inspect the decking; replace the first two sheets at no charge and use signed change orders for additional repairs.",
      "Furnish and install an architectural asphalt shingle roofing system across {{TOTAL_SQUARES}} squares.",
      "Remove all trash and debris with our dump trailer.",
      "Magnet sweep the property for any nails, screws, or fasteners.",
      "Complete cleaning to the owner’s satisfaction."
    ],
    componentBullets: [
      "Ice and water shield in valleys and around jacks, pipes, and chimneys.",
      "Synthetic underlayment on the entire roof (Jefferson and Orleans Parish receive a double layer per parish standard).",
      "New 26-gauge drip edge flashing on the entire roof.",
      "Atlas ProCut® HP42® starter shingles.",
      "New 3-in-1 roof jacks.",
      "Atlas Pinnacle Pristine Designer architectural shingles.",
      "Atlas ventilation components and Atlas Pro-Cut Hip & Ridge™ caps."
    ],
    tags: ["roof", "asphalt", "atlas", "non-fortified"]
  },
  {
    name: "GAF Timberline HDZ (Non-FORTIFIED)",
    category: "Roofing",
    description: "Non-fortified GAF Timberline HDZ™ shingle roofing system.",
    unitPrice: 0,
    warrantyText: "GAF Gold Pledge warranty with 50-year system coverage, 15-year wind protection, and 25-year workmanship warranty.",
    scopeIntro: "Install a non-fortified GAF Timberline HDZ™ shingle roofing system covering {{TOTAL_SQUARES}} squares.",
    scopeBullets: [
      "Demo and remove all shingles and underlayment down to the bare decking.",
      "Inspect decking and replace the first two sheets at no charge; perform additional structural repairs via signed change orders.",
      "Furnish and install an architectural asphalt shingle roofing system across {{TOTAL_SQUARES}} squares.",
      "Remove all trash and debris from the property using our dump trailer.",
      "Magnet sweep the property for nails, screws, and fasteners.",
      "Complete cleaning to the owner’s satisfaction."
    ],
    componentBullets: [
      "Ice and water shield in valleys and around jacks, pipes, and chimneys (GAF WeatherWatch™).",
      "GAF FeltBuster™ synthetic underlayment over the entire roof (double layer in Jefferson and Orleans Parish per parish standard).",
      "New 26-gauge drip edge flashing on the entire roof.",
      "GAF Pro-Start™ starters at eaves and rakes.",
      "New 3-in-1 roof jacks.",
      "GAF Timberline HDZ™ architectural shingles.",
      "New ventilation with GAF ventilation components and GAF Seal-A-Ridge™ hip and ridge caps."
    ],
    tags: ["roof", "asphalt", "gaf", "non-fortified"]
  },
  {
    name: "Owens Corning Duration (Non-FORTIFIED)",
    category: "Roofing",
    description: "Non-fortified Owens Corning Duration™ shingle roofing system.",
    unitPrice: 0,
    warrantyText: "Owens Corning Preferred warranty and 10-year workmanship warranty from Owens Corning.",
    scopeIntro: "Install a non-fortified Owens Corning Duration™ shingle roofing system covering {{TOTAL_SQUARES}} squares.",
    scopeBullets: [
      "Demo and remove all shingles and underlayment down to the bare decking.",
      "Inspect decking and replace the first two sheets at no charge; additional underlying damage repaired only with a signed change order.",
      "Furnish and install an architectural asphalt shingle roofing system across {{TOTAL_SQUARES}} squares.",
      "Remove all trash and debris with our dump trailer.",
      "Magnet sweep the property for nails, screws, and fasteners.",
      "Complete cleaning to the owner’s satisfaction."
    ],
    componentBullets: [
      "Ice and water shield in valleys and around jacks, pipes, and chimneys (Owens Corning RhinoRoof® or equivalent).",
      "Owens Corning RhinoRoof® U20 synthetic underlayment on the entire roof (double layer in Jefferson and Orleans Parish per parish standard).",
      "New drip edge flashing on the entire roof.",
      "Owens Corning Starter Strip Plus™ starter shingles.",
      "New 3-in-1 roof jacks.",
      "Owens Corning Duration™ architectural shingles.",
      "New ventilation and Owens Corning Pro Edge™ hip and ridge caps."
    ],
    tags: ["roof", "asphalt", "owens-corning", "non-fortified"]
  },
  {
    name: "Atlas Pinnacle Pristine Designer (FORTIFIED)",
    category: "Roofing",
    description: "FORTIFIED Atlas Pinnacle Pristine Designer shingle roofing system.",
    unitPrice: 0,
    warrantyText: "Guaranteed FORTIFIED certificate, limited lifetime material warranty from Atlas Roofing, and 5-year workmanship warranty from Zuppardo’s Renovations.",
    scopeIntro: "Install a FORTIFIED Atlas Pinnacle Pristine Designer shingle roofing system covering {{TOTAL_SQUARES}} squares.",
    scopeBullets: [
      "Demo and remove all shingles and underlayment down to the bare decking.",
      "Inspect decking; replace the first two sheets free of charge and perform additional repairs only after a signed change order.",
      "Furnish and install a FORTIFIED architectural asphalt shingle roofing system across {{TOTAL_SQUARES}} squares.",
      "Coordinate with the FORTIFIED evaluator and provide all required photos and documentation to obtain certification.",
      "Remove all trash and debris with our dump trailer, magnet sweep the property, and clean to the owner’s satisfaction."
    ],
    componentBullets: [
      "Ring-shank nails 4 inches on center across the entire roof deck.",
      "Ice and water membrane on the entire roof deck with bond-break as needed.",
      "26-gauge FORTIFIED-standard drip edge flashing nailed 4 inches on center in a diagonal pattern.",
      "Atlas Pro-Cut® Universal 9XR self-adhered starter roll.",
      "New 3-in-1 roof jacks.",
      "Atlas Pinnacle Pristine Designer architectural shingles.",
      "Atlas ventilation components and Atlas Pro-Cut Hip & Ridge™ caps."
    ],
    tags: ["roof", "asphalt", "atlas", "fortified"]
  },
  {
    name: "GAF Timberline HDZ (FORTIFIED)",
    category: "Roofing",
    description: "FORTIFIED GAF Timberline HDZ™ shingle roofing system with 50-year system warranty and 15-year unlimited wind protection.",
    unitPrice: 0,
    warrantyText: "Guaranteed FORTIFIED certificate, GAF Gold Pledge warranty, 15-year unlimited wind warranty, and 25-year workmanship warranty.",
    scopeIntro: "Install a FORTIFIED GAF Timberline HDZ™ shingle roofing system covering {{TOTAL_SQUARES}} squares.",
    scopeBullets: [
      "Demo and remove all shingles and underlayment down to the bare decking.",
      "Inspect decking; replace the first two sheets free of charge and obtain signed change orders for additional repairs.",
      "Furnish and install a FORTIFIED architectural asphalt shingle roofing system across {{TOTAL_SQUARES}} squares.",
      "Coordinate with the FORTIFIED evaluator and submit all necessary documentation and photos for certification.",
      "Remove all trash and debris using our dump trailer, magnet sweep the property, and complete cleaning to the owner’s satisfaction."
    ],
    componentBullets: [
      "Ring-shank nails 4 inches on center across the entire roof deck.",
      "Ice and water membrane (GAF WeatherWatch™) on the entire roof deck with bond-break as needed.",
      "26-gauge FORTIFIED-standard drip edge flashing nailed 4 inches on center in a diagonal pattern.",
      "GAF QuickStart™ self-adhered starter.",
      "New 3-in-1 roof jacks.",
      "GAF Timberline HDZ™ architectural shingles.",
      "New ventilation and GAF Seal-A-Ridge™ hip and ridge caps."
    ],
    tags: ["roof", "asphalt", "gaf", "fortified"]
  },
  {
    name: "Zuppardo’s Special – Atlas ProLam (FORTIFIED)",
    category: "Roofing",
    description: "Zuppardo’s Special FORTIFIED Atlas ProLam shingle roofing system.",
    unitPrice: 0,
    warrantyText: "Guaranteed FORTIFIED certificate plus 2-year material and 2-year workmanship warranty from Zuppardo’s Renovations.",
    scopeIntro: "Install the Zuppardo’s Special FORTIFIED Atlas ProLam shingle roofing system covering {{TOTAL_SQUARES}} squares.",
    scopeBullets: [
      "Demo and remove all shingles and underlayment down to the bare decking.",
      "Inspect decking; replace the first two sheets at no charge and perform additional repairs only with a signed change order.",
      "Furnish and install a FORTIFIED architectural asphalt shingle roofing system across {{TOTAL_SQUARES}} squares.",
      "Coordinate with the FORTIFIED evaluator and submit required photos and documentation for certification.",
      "Remove trash and debris with our dump trailer, magnet sweep the property, and clean to the owner’s satisfaction."
    ],
    componentBullets: [
      "Ring-shank nails 4 inches on center across the entire roof deck.",
      "Ice and water membrane on the entire roof deck with bond-break as needed.",
      "26-gauge FORTIFIED-standard drip edge flashing nailed 4 inches on center in a diagonal pattern.",
      "Self-adhered starter course for Atlas ProLam shingles.",
      "New 3-in-1 roof jacks.",
      "Atlas ProLam architectural shingles.",
      "New ventilation and Atlas Pro-Cut Hip & Ridge™ caps."
    ],
    tags: ["roof", "asphalt", "atlas", "fortified"]
  },
  {
    name: "Owens Corning Duration (FORTIFIED)",
    category: "Roofing",
    description: "FORTIFIED Owens Corning Duration™ shingle roofing system.",
    unitPrice: 0,
    warrantyText: "Guaranteed FORTIFIED certificate, Owens Corning Preferred warranty, and 10-year workmanship warranty from Owens Corning.",
    scopeIntro: "Install a FORTIFIED Owens Corning Duration™ shingle roofing system covering {{TOTAL_SQUARES}} squares.",
    scopeBullets: [
      "Demo and remove all shingles and underlayment down to the bare decking.",
      "Inspect decking; replace the first two sheets free of charge and complete additional repairs only with a signed change order.",
      "Furnish and install a FORTIFIED architectural asphalt shingle roofing system across {{TOTAL_SQUARES}} squares.",
      "Coordinate with the FORTIFIED evaluator and submit all necessary photos and documentation to obtain a FORTIFIED certificate.",
      "Remove trash and debris with our dump trailer, magnet sweep the property, and complete cleaning to the owner’s satisfaction."
    ],
    componentBullets: [
      "Ring-shank nails 4 inches on center across the entire roof deck.",
      "Owens Corning Rhino™ ice and water membrane on the entire roof deck with bond-break as needed.",
      "26-gauge FORTIFIED-standard drip edge flashing nailed 4 inches on center in a diagonal pattern.",
      "Owens Corning self-adhered starter roll.",
      "New 3-in-1 roof jacks.",
      "Owens Corning Duration™ architectural shingles.",
      "New ventilation and Owens Corning Pro Edge™ hip and ridge caps."
    ],
    tags: ["roof", "asphalt", "owens-corning", "fortified"]
  },
  {
    name: "Modified Bitumen Torch-Down Roof System",
    category: "Roofing",
    description: "Two-ply Mule-Hide APP torch-down roof for commercial or low-slope structures.",
    unitPrice: 0,
    warrantyText: "20-year Mule-Hide material warranty and 15-year workmanship coverage from Zuppardo’s.",
    scopeIntro: "Install a two-ply Mule-Hide APP torch-down roof covering {{TOTAL_SQUARES}} squares (including waste).",
    scopeBullets: [
      "Demo approximately {{TOTAL_SQUARES}} squares of existing torch-down roof to the bare deck.",
      "Inspect decking for damage; replace sheets via signed change orders (two sheets included).",
      "Install tapered insulation where ponding exists and mechanically fasten to the deck.",
      "Install SA base sheet, primer on flashings, and heat-fuse the APP cap sheet.",
      "Replace roof jacks, vents, apron, and fabricate custom flashings as required.",
      "Supply dumpster, clean daily, and remove debris upon completion."
    ],
    componentBullets: [
      "Tapered insulation (as needed) to improve drainage.",
      "Mule-Hide SA base sheet and primer at all flashings.",
      "Mule-Hide APP torch cap sheet heat-fused throughout.",
      "New roof jacks, capped pipes, vents, and perimeter metal.",
      "Custom-fabricated flashings at transitions."
    ],
    tags: ["roof", "flat", "torch-down"]
  },
  {
    name: "Mule-Hide Self-Adhered Flat Roof",
    category: "Roofing",
    description: "Two-ply self-adhered Mule-Hide roof for low-slope sections.",
    unitPrice: 540,
    warrantyText: "20-year Mule-Hide material warranty plus 15-year workmanship warranty.",
    scopeIntro: "Install a Mule-Hide self-adhered roof across {{TOTAL_SQUARES}} squares of low-slope roof.",
    scopeBullets: [
      "Demo approximately {{TOTAL_SQUARES}} squares of the existing low-slope roof.",
      "Replace roof jacks and capped pipes as needed.",
      "Install SA base sheet and primer on all flashings.",
      "Install Mule-Hide self-adhered cap sheet across the roof.",
      "Clean up daily and haul debris off-site."
    ],
    componentBullets: [
      "Mule-Hide SA base sheet.",
      "Primer at flashings and penetrations.",
      "Self-adhered Mule-Hide cap sheet.",
      "New drip edge, vents, aprons, and custom flashings as required."
    ],
    tags: ["roof", "flat", "mule-hide"]
  },
  {
    name: "Met-A-Gard Metal Roof Coating",
    category: "Roofing",
    description: "American WeatherStar Met-A-Gard™ roof restoration system with bright-white finish.",
    unitPrice: 0,
    warrantyText: "15-year American WeatherStar NDL warranty plus Zuppardo’s workmanship warranty.",
    scopeIntro: "Restore the metal roof across {{TOTAL_SQUARES}} squares using the Met-A-Gard™ system.",
    scopeBullets: [
      "Pressure wash roof surfaces and apply red-oxide primer where rust is present.",
      "Treat seams and fasteners with 522 waterproofing mastic; tighten or replace fasteners as needed.",
      "Remove vents/skylight flashings and reflash per system requirements.",
      "Apply ivory acrylic 211 base coat followed by bright-white acrylic 211 top coat.",
      "Clean the site daily throughout the 5-day installation."
    ],
    componentBullets: [
      "American WeatherStar 522 waterproofing mastic.",
      "Ivory-tinted Acrylic 211 base coat.",
      "Bright-white Acrylic 211 top coat.",
      "Fastener replacement and stitch screws where required."
    ],
    tags: ["roof", "coating", "metal"]
  },
  {
    name: "James Hardie Siding Replacement",
    category: "Exterior",
    description: "Remove vinyl siding and install a full James Hardie™ HZ10 lap siding system with trim and paint.",
    unitPrice: 0,
    warrantyText: "25-year James Hardie material warranty and 5-year workmanship warranty from Zuppardo’s.",
    scopeIntro: "Replace vinyl siding with James Hardie HZ10 siding across approximately {{TOTAL_SQUARES}} squares (use squares as project units).",
    scopeBullets: [
      "Remove and haul away vinyl siding and all trim around windows/doors.",
      "Inspect exterior walls for damage prior to installing new materials.",
      "Install Tyvek house wrap and tape all openings; add drip caps or PVC over windows/doors.",
      "Install James Hardie trim on windows, doors, inside/outside corners, and mounting blocks.",
      "Install primed James Hardie lap siding (customer-selected exposure) and finish with Sherwin-Williams paint until satisfied.",
      "Remove/reinstall cameras, fixtures, and outlet boxes; clean the site daily."
    ],
    componentBullets: [
      "Tyvek house wrap with taped penetrations.",
      "Drip caps or PVC trim over all openings.",
      "James Hardie 4\" trim boards and mounting blocks.",
      "James Hardie HZ10 lap siding (primed) plus two coats of Sherwin-Williams paint."
    ],
    tags: ["siding", "james-hardie"]
  },
  {
    name: "Cypress Weatherboard Replacement",
    category: "Exterior",
    description: "Remove wood lap siding, install Tyvek, treated trim, and new cypress weatherboards.",
    unitPrice: 0,
    warrantyText: "25-year manufacturer material warranty and 5-year workmanship warranty.",
    scopeIntro: "Replace wood lap siding with cypress weatherboards across approximately {{TOTAL_SQUARES}} squares (use squares for estimating wall area).",
    scopeBullets: [
      "Remove and haul away existing wood lap siding and trim.",
      "Inspect studs for damage; repairs only performed via approved change orders.",
      "Install Tyvek house wrap and drip cap/PVC over windows and doors.",
      "Install treated wood trim on corners, mounting blocks, and window/door surrounds.",
      "Install beveled or square cypress weatherboards (multiple width options).",
      "Clean the site and reinstall fixtures to the owner’s satisfaction."
    ],
    componentBullets: [
      "Tyvek house wrap with taped seams.",
      "Treated wood trim (4\") for corners, windows, doors, and accessories.",
      "Cypress weatherboards in beveled or square profiles.",
      "Cleanup, fixture removal/reinstall, and daily housekeeping."
    ],
    tags: ["siding", "cypress"]
  },
  {
    name: "Exterior Paint – Premium Prep",
    category: "Painting",
    description: "Full exterior soft wash, repairs, and two coats of Sherwin-Williams Super Paint™.",
    unitPrice: 0,
    warrantyText: "5-year workmanship warranty plus manufacturer finish warranty.",
    scopeIntro: "Prep and paint the exterior of the home (treat {{TOTAL_SQUARES}} as project units) with Sherwin-Williams Super Paint™.",
    scopeBullets: [
      "Soft wash the entire exterior and prepare substrates for coating.",
      "Perform minor repairs, caulk, sand, and fill mortar/stucco as discussed with the client.",
      "Prime areas as needed and apply two coats of Sherwin-Williams Super Paint™ to all included surfaces.",
      "Coordinate on-site with Sherwin-Williams reps to select colors, sheen, and coating type.",
      "Clean the site daily and upon completion."
    ],
    componentBullets: [
      "Soft wash/prep materials.",
      "Caulks, fillers, and patching compounds as required.",
      "Sherwin-Williams primers and Super Paint™ topcoats.",
      "Protection/masking of windows, doors, fascia, soffit, trim, gutters, and other included elements."
    ],
    tags: ["painting", "exterior"]
  },
  {
    name: "Interior Paint – Whole Home",
    category: "Painting",
    description: "Full interior prep, repairs, and two coats of Sherwin-Williams Duration® paint.",
    unitPrice: 0,
    warrantyText: "5-year workmanship warranty plus Sherwin-Williams product warranty.",
    scopeIntro: "Prep and paint the entire interior (treat {{TOTAL_SQUARES}} as project units) with Sherwin-Williams Duration® paint.",
    scopeBullets: [
      "Prep, cover, and protect floors, furniture, racks, and shelving.",
      "Perform minor repairs to walls, ceilings, trim, stair components, and apply caulk where needed.",
      "Apply two coats (or until satisfied) of Sherwin-Williams Duration® to walls, ceilings, carpentry, cabinets, stairs, railings, fireplace, porch ceiling, and window headers.",
      "Coordinate with Sherwin-Williams reps for product selection and sheen.",
      "Clean the site daily and maintain a punch-list process until the client is 100% satisfied."
    ],
    componentBullets: [
      "Masking/taping materials and protective coverings.",
      "Sherwin-Williams primers and Duration® interior paints.",
      "Minor drywall/trim repair materials and caulks."
    ],
    tags: ["painting", "interior"]
  },
  {
    name: "Cypress Siding Restoration & Paint",
    category: "Exterior",
    description: "Restore existing cypress siding, replace damaged sections, and refinish with Sherwin-Williams coatings.",
    unitPrice: 0,
    warrantyText: "Lifetime workmanship warranty from Zuppardo’s plus 25-year material warranty.",
    scopeIntro: "Restore existing cypress siding and apply new finishes (treat {{TOTAL_SQUARES}} as project units).",
    scopeBullets: [
      "Remove vinyl overlay and inspect existing cypress siding (assume 25% replacement).",
      "Replace damaged siding (7 squares existing + 5 squares on addition) with new cypress boards.",
      "Perform additional sanding on existing siding to achieve a uniform surface.",
      "Prime as needed and apply two coats of Sherwin-Williams Super Paint™.",
      "Clean up daily, remove/reinstall fixtures, and leave the site immaculate."
    ],
    componentBullets: [
      "Replacement cypress siding boards for damaged areas.",
      "Sherwin-Williams primers and Super Paint™ finish coats.",
      "Sanding/repair materials and cleanup equipment."
    ],
    tags: ["siding", "painting", "cypress"]
  },
  {
    name: "Vertical Cedar Fence with Header",
    category: "Exterior",
    description: "Install western red cedar fencing with header trim and pedestrian gates.",
    unitPrice: 0,
    warrantyText: "5-year workmanship warranty from Zuppardo’s.",
    scopeIntro: "Install approximately {{TOTAL_SQUARES}} linear feet of 8' western red cedar fence with header trim and pedestrian gates (use squares as a placeholder for linear footage).",
    scopeBullets: [
      "Install 8' western red cedar fence around approximately 177 LF with three runners per panel.",
      "Secure each board with six nails and repair/replace posts as needed.",
      "Install header trim cap along 177 LF and furnish two 3' pedestrian gates.",
      "Clean up and remove debris to the owner’s satisfaction."
    ],
    componentBullets: [
      "Western red cedar pickets and runners.",
      "Header trim cap boards.",
      "Two 3' pedestrian gates including hardware.",
      "Fasteners and post repairs as required."
    ],
    tags: ["fence", "cedar"]
  },
  {
    name: "Exterior Painting (Standard)",
    category: "Painting",
    description: "Soft wash, caulk, prime, and paint exterior surfaces with Sherwin-Williams Super Paint™.",
    unitPrice: 0,
    warrantyText: "5-year workmanship warranty from Zuppardo’s.",
    scopeIntro: "Wash, prep, and paint the home exterior including siding, porch elements, and trim ({{TOTAL_SQUARES}} project units).",
    scopeBullets: [
      "Soft wash the entire exterior and perform basic prep work.",
      "Caulk seams and nail holes, prime as needed, and apply one coat of primer plus two coats of Super Paint™ until satisfied.",
      "Include siding walls, porch ceiling/floor, doors, columns, trim, gutters, and railings per scope.",
      "Work with Sherwin-Williams reps to finalize coating schedule.",
      "Clean the site daily and after completion."
    ],
    componentBullets: [
      "Sherwin-Williams primers and Super Paint™ topcoats.",
      "Caulking, patching, and prep materials.",
      "Masking, protection, and cleanup supplies."
    ],
    tags: ["painting", "exterior"]
  },
  {
    name: "Full Exterior + Interior Paint Package",
    category: "Painting",
    description: "Combined exterior and interior painting scope with turnkey management (reference price $41,150 for baseline project).",
    unitPrice: 0,
    warrantyText: "5-year workmanship warranty plus 10% discount on next renovation.",
    scopeIntro: "Deliver a comprehensive exterior and interior repaint package ({{TOTAL_SQUARES}} used as project units).",
    scopeBullets: [
      "Exterior: soft wash, repairs, primer, and two coats of Sherwin-Williams Super Paint™ on all listed surfaces.",
      "Interior: prep, mask, perform minor repairs, and apply two coats of Sherwin-Williams Duration® on all included areas.",
      "Coordinate closely with Sherwin-Williams reps and the client for sheen and product selections.",
      "Maintain immediate start scheduling and manage the project daily until completion.",
      "Clean job site daily and complete final cleaning with the client before collecting final payment."
    ],
    componentBullets: [
      "Sherwin-Williams Super Paint™ (exterior) and Duration® (interior).",
      "Primers, caulks, fillers, and sanding materials.",
      "Protection for floors, furniture, and site cleanup equipment."
    ],
    tags: ["painting", "exterior", "interior"]
  },
  {
    name: "Gutter Replacement – Aluminum Seamless",
    category: "Exterior",
    description: "Remove existing gutters and install 319 LF of seamless aluminum gutters with downspouts.",
    unitPrice: 0,
    warrantyText: "5-year workmanship warranty from Zuppardo’s.",
    scopeIntro: "Replace approximately 319 linear feet of seamless aluminum gutters with six downspouts (reference {{TOTAL_SQUARES}} as units for pricing).",
    scopeBullets: [
      "Demo and haul off 241 LF of existing gutters and six downspouts.",
      "Furnish and install 319 LF of powder-coated aluminum seamless gutters with six 13' downspouts.",
      "Secure gutters to rafters with screws and ensure all debris is cleaned up."
    ],
    componentBullets: [
      "K-style aluminum seamless gutters and matching downspouts.",
      "Fasteners, straps, and sealants.",
      "Removal/haul-off services."
    ],
    tags: ["gutters"]
  },
  {
    name: "Other Custom Service",
    category: "Custom",
    description: "Placeholder template for custom scopes.",
    unitPrice: 0,
    warrantyText: "As specified; includes Zuppardo’s workmanship warranty unless noted otherwise.",
    scopeIntro: "Custom scope tailored to {{TOTAL_SQUARES}} project units.",
    componentBullets: ["As specified"],
    scopeBullets: [],
    tags: ["custom"]
  }
];

const slugify = (value: string) =>
  value
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
        scopeBullets: product.scopeBullets as Prisma.JsonArray,
        componentBullets: product.componentBullets as Prisma.JsonArray,
        tags: product.tags,
        isApproved: true,
      },
      create: {
        ...product,
        slug: slugify(product.name),
        scopeBullets: product.scopeBullets as Prisma.JsonArray,
        componentBullets: product.componentBullets as Prisma.JsonArray,
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

  await prisma.setting.upsert({
    where: { key: "branding" },
    update: { value: defaultBranding },
    create: { key: "branding", value: defaultBranding },
  });
}

async function upsertSalesReps() {
  // Clear existing to avoid unique constraint collisions when reseeding
  await prisma.salesRep.deleteMany({});
  const seen = new Set<string>();
  const deduped: { name: string; phone?: string; email: string; active: boolean }[] = [];
  for (const rep of salesReps) {
    const email = (rep.email && rep.email.trim().toLowerCase()) ? rep.email.trim().toLowerCase() : `${slugify(rep.name)}@zuppardos.local`;
    if (seen.has(email)) continue;
    seen.add(email);
    deduped.push({ name: rep.name, phone: rep.phone, email, active: true });
  }
  if(deduped.length){
    await prisma.salesRep.createMany({ data: deduped, skipDuplicates: true });
  }
}

async function main() {
  await upsertDefaults();
  await upsertSalesReps();
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
