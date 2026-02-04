---
description: Implementation plan for Risk Control Matrix feature
---

# Risk Control Matrix Implementation Plan

## Overview
The Risk Control Matrix (RCM) is a comprehensive tool that maps organizational risks to their corresponding controls, providing a structured approach to risk management and compliance.

## Phase 1: Database Schema Design

### 1.1 Create Core Tables

**Table: `industries`**
- `industry_id` (UUID, PK)
- `industry_name` (TEXT, UNIQUE) - e.g., "Banking", "Telecom", "Healthcare", "Manufacturing"
- `description` (TEXT, NULLABLE)
- `created_at` (TIMESTAMP)

**Table: `sectors`**
- `sector_id` (UUID, PK)
- `industry_id` (UUID, FK → industries)
- `sector_name` (TEXT) - e.g., "Finance", "IT", "Operations"
- `description` (TEXT, NULLABLE)
- `created_at` (TIMESTAMP)

**Table: `functions`**
- `function_id` (UUID, PK)
- `sector_id` (UUID, FK → sectors)
- `function_name` (TEXT) - e.g., "Payment Processing", "Data Management"
- `description` (TEXT, NULLABLE)
- `created_at` (TIMESTAMP)

**Table: `risk_control_matrix`**
- `rcm_id` (UUID, PK)
- `industry_id` (UUID, FK → industries)
- `sector_id` (UUID, FK → sectors)
- `function_id` (UUID, FK → functions)
- `risk_category_id` (UUID, FK → risk_categories) - Reuse existing table
- `risk_description` (TEXT) - Detailed risk scenario
- `control_description` (TEXT) - How the risk is mitigated
- `reference_standard` (TEXT) - e.g., "ISO 27001:2013 A.12.1.1"
- `control_type` (ENUM: 'Preventive', 'Detective', 'Corrective')
- `control_frequency` (ENUM: 'Continuous', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 1.2 Create Linking Table (Optional - for audit findings)
**Table: `rcm_findings_link`**
- `link_id` (UUID, PK)
- `rcm_id` (UUID, FK → risk_control_matrix)
- `observation_id` (UUID, FK → audit_observations)
- `created_at` (TIMESTAMP)

This allows linking audit findings to specific RCM entries.

## Phase 2: UI/UX Design

### 2.1 Navigation
- Add "Risk Control Matrix" to the main navigation menu
- Icon: Shield with checkmark or grid icon

### 2.2 Main RCM View Components

**A. Filter Panel (Top)**
- Industry dropdown
- Sector dropdown (filtered by industry)
- Function dropdown (filtered by sector)
- Risk Category dropdown
- Control Type filter
- Search bar (searches across risk/control descriptions)

**B. RCM Table (Main Area)**
Columns:
1. Industry
2. Sector
3. Function
4. Risk Category
5. Risk Description (truncated with expand)
6. Control Description (truncated with expand)
7. Reference Standard
8. Control Type (badge)
9. Control Frequency (badge)
10. Actions (View/Edit/Delete)

**C. Action Buttons**
- "+ New Control" (primary button)
- "Export to Excel" 
- "Export to PDF"

### 2.3 Modal: New/Edit Control
Form sections:
1. **Organization Context**
   - Industry (dropdown)
   - Sector (dropdown, filtered by industry)
   - Function (dropdown, filtered by sector)
   - Risk Category (dropdown)

2. **Risk Details**
   - Risk Description (textarea)

3. **Control Details**
   - Control Description (textarea)
   - Reference Standard (text input with suggestions)
   - Control Type (dropdown: Preventive/Detective/Corrective)
   - Control Frequency (dropdown: Continuous/Daily/Weekly/Monthly/Quarterly/Annual)

### 2.4 Detail View Modal
- Full risk and control descriptions
- All metadata fields
- Linked audit findings (if any)
- Edit/Delete actions

## Phase 3: Backend Implementation

### 3.1 Database Migrations
```sql
-- Migration 1: Create industries table
CREATE TABLE industries (
  industry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Migration 2: Create sectors table
CREATE TABLE sectors (
  sector_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID REFERENCES industries(industry_id) ON DELETE CASCADE,
  sector_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Migration 3: Create functions table
CREATE TABLE functions (
  function_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES sectors(sector_id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Migration 4: Create risk_control_matrix table
CREATE TYPE control_type AS ENUM ('Preventive', 'Detective', 'Corrective');
CREATE TYPE control_frequency AS ENUM ('Continuous', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual');

CREATE TABLE risk_control_matrix (
  rcm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID REFERENCES industries(industry_id),
  sector_id UUID REFERENCES sectors(sector_id),
  function_id UUID REFERENCES functions(function_id),
  risk_category_id UUID REFERENCES risk_categories(category_id),
  risk_description TEXT NOT NULL,
  control_description TEXT NOT NULL,
  reference_standard TEXT,
  control_type control_type,
  control_frequency control_frequency,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Migration 5: Create RLS policies
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_control_matrix ENABLE ROW LEVEL SECURITY;

-- Policies (adjust based on your role structure)
CREATE POLICY "Allow all for authenticated users" ON industries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON sectors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON functions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON risk_control_matrix FOR ALL USING (auth.role() = 'authenticated');
```

### 3.2 Seed Data (Examples)
```sql
-- Industries
INSERT INTO industries (industry_name, description) VALUES
  ('Banking', 'Banking and financial services'),
  ('Telecom', 'Telecommunications and network services'),
  ('Healthcare', 'Healthcare and medical services'),
  ('Manufacturing', 'Manufacturing and production'),
  ('Retail', 'Retail and e-commerce');

-- Sectors (Banking examples)
INSERT INTO sectors (industry_id, sector_name) VALUES
  ((SELECT industry_id FROM industries WHERE industry_name = 'Banking'), 'Information Technology'),
  ((SELECT industry_id FROM industries WHERE industry_name = 'Banking'), 'Finance'),
  ((SELECT industry_id FROM industries WHERE industry_name = 'Banking'), 'Operations'),
  ((SELECT industry_id FROM industries WHERE industry_name = 'Banking'), 'Compliance');

-- Functions (IT examples)
INSERT INTO functions (sector_id, function_name) VALUES
  ((SELECT sector_id FROM sectors WHERE sector_name = 'Information Technology' LIMIT 1), 'Access Management'),
  ((SELECT sector_id FROM sectors WHERE sector_name = 'Information Technology' LIMIT 1), 'Data Backup'),
  ((SELECT sector_id FROM sectors WHERE sector_name = 'Information Technology' LIMIT 1), 'Incident Response'),
  ((SELECT sector_id FROM sectors WHERE sector_name = 'Information Technology' LIMIT 1), 'Change Management');
```

## Phase 4: Frontend Implementation

### 4.1 TypeScript Types
```typescript
interface Industry {
  industry_id: string
  industry_name: string
  description: string | null
  created_at: string
}

interface Sector {
  sector_id: string
  industry_id: string
  sector_name: string
  description: string | null
  created_at: string
}

interface Function {
  function_id: string
  sector_id: string
  function_name: string
  description: string | null
  created_at: string
}

interface RiskControlMatrix {
  rcm_id: string
  industry_id: string
  sector_id: string
  function_id: string
  risk_category_id: string
  risk_description: string
  control_description: string
  reference_standard: string | null
  control_type: 'Preventive' | 'Detective' | 'Corrective'
  control_frequency: 'Continuous' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual'
  created_at: string
  updated_at: string
  // Joined data
  industries?: Industry
  sectors?: Sector
  functions?: Function
  risk_categories?: RiskCategory
}
```

### 4.2 State Management
```typescript
const [rcmEntries, setRcmEntries] = useState<RiskControlMatrix[]>([])
const [industries, setIndustries] = useState<Industry[]>([])
const [sectors, setSectors] = useState<Sector[]>([])
const [functions, setFunctions] = useState<Function[]>([])
const [selectedIndustry, setSelectedIndustry] = useState<string>('')
const [selectedSector, setSelectedSector] = useState<string>('')
const [selectedFunction, setSelectedFunction] = useState<string>('')
const [showRcmModal, setShowRcmModal] = useState(false)
const [selectedRcm, setSelectedRcm] = useState<RiskControlMatrix | null>(null)
```

### 4.3 Data Fetching
```typescript
async function fetchRCMData() {
  const { data } = await supabase
    .from('risk_control_matrix')
    .select(`
      *,
      industries(industry_name),
      sectors(sector_name),
      functions(function_name),
      risk_categories(category_name)
    `)
    .order('created_at', { ascending: false })
  
  if (data) setRcmEntries(data)
}
```

## Phase 5: Advanced Features

### 5.1 Dashboard Analytics
- Total controls by sector (pie chart)
- Control effectiveness distribution (bar chart)
- Controls due for testing (table)
- Risk coverage heatmap (sector vs risk category)

### 5.2 Export Functionality
- **Excel Export**: Full RCM with all fields
- **PDF Export**: Formatted report with filters applied
- **CSV Export**: For data analysis

### 5.3 Integration with Audit Findings
- When creating a finding, suggest related RCM entries
- Link findings to controls that failed
- Show control effectiveness trends based on findings

### 5.4 Testing Workflow
- Schedule control tests
- Record test results
- Auto-update effectiveness ratings
- Send notifications for overdue tests

## Phase 6: Testing & Deployment

### 6.1 Testing Checklist
- [ ] CRUD operations for all tables
- [ ] Filter and search functionality
- [ ] Export to Excel/PDF
- [ ] RLS policies working correctly
- [ ] Mobile responsiveness
- [ ] Performance with 100+ entries

### 6.2 Deployment Steps
1. Run database migrations
2. Insert seed data
3. Update TypeScript types
4. Deploy frontend changes
5. Test in production
6. Train users

## Estimated Timeline

- **Phase 1 (Database)**: 2-3 hours
- **Phase 2 (UI Design)**: 1-2 hours (planning)
- **Phase 3 (Backend)**: 2-3 hours
- **Phase 4 (Frontend)**: 4-6 hours
- **Phase 5 (Advanced)**: 4-6 hours (optional)
- **Phase 6 (Testing)**: 2-3 hours

**Total**: 15-23 hours for full implementation

## Priority Recommendations

**Must Have (MVP)**:
1. Core tables (industries, sectors, functions, rcm)
2. Basic CRUD operations
3. Filter by industry/sector/function/category
4. Simple table view with all required fields
5. PDF export

**Should Have**:
1. Control type/frequency badges with color coding
2. Search functionality across descriptions
3. Excel export
4. Cascading dropdowns (Industry → Sector → Function)

**Nice to Have**:
1. Dashboard analytics (controls by industry/sector)
2. Integration with audit findings
3. Bulk import from Excel
4. Reference standard suggestions

---

## Field Summary

**Required Fields**:
- Industry (e.g., Banking, Telecom)
- Sector (e.g., IT, Finance)
- Function (e.g., Access Management)
- Risk Category (from existing table)
- Risk Description
- Control Description
- Reference Standard

**Additional Fields**:
- Control Type (Preventive/Detective/Corrective)
- Control Frequency (Continuous/Daily/Weekly/Monthly/Quarterly/Annual)

---

## Next Steps

Would you like me to:
1. **Start with Phase 1** (Create database tables and migrations)?
2. **Create a visual mockup** of the UI first?
3. **Implement the full MVP** (Phases 1-4)?
4. **Make any other modifications** to the plan?

Let me know how you'd like to proceed! 🚀
