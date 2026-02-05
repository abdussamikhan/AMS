import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Observation, Profile } from '../types'

export const downloadCSV = (filteredObservations: Observation[]) => {
    const headers = ["Condition", "Criteria", "Cause", "Effect", "Recommendation", "Rating", "Framework", "Reference", "Category"]
    const rows = filteredObservations.map(obs => [
        `"${obs.condition.replace(/"/g, '""')}"`,
        `"${obs.criteria.replace(/"/g, '""')}"`,
        `"${(obs.cause || "").replace(/"/g, '""')}"`,
        `"${(obs.effect || "").replace(/"/g, '""')}"`,
        `"${(obs.recommendation || "").replace(/"/g, '""')}"`,
        obs.risk_rating,
        obs.audit_procedures?.framework_mapping?.framework_name,
        obs.audit_procedures?.framework_mapping?.reference_code,
        obs.audit_procedures?.framework_mapping?.risk_categories?.category_name
    ])

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `AuditAce_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    link.click()
    document.body.removeChild(link)
}

export const downloadRiskRegisterCSV = (entries: any[]) => {
    const headers = ["Risk Title", "Risk Description", "Category", "Owner", "Inherent Score", "Residual Score", "Control Title", "Control Description", "Fiscal Year"]
    const rows = entries.map(entry => [
        `"${(entry.risk_title || "").replace(/"/g, '""')}"`,
        `"${(entry.risk_description || "").replace(/"/g, '""')}"`,
        `"${(entry.risk_categories?.category_name || "Uncategorized").replace(/"/g, '""')}"`,
        `"${(entry.risk_owner || "Unassigned").replace(/"/g, '""')}"`,
        `${entry.inherent_likelihood * entry.inherent_impact}`,
        `${entry.residual_likelihood * entry.residual_impact}`,
        `"${(entry.control_title || "").replace(/"/g, '""')}"`,
        `"${(entry.control_description || "").replace(/"/g, '""')}"`,
        `${entry.fiscal_year}`
    ])

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `Risk_Register_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

export const generatePDF = (
    filteredObservations: Observation[],
    profile: Profile | null,
    stats: { total: number; critical: number; high: number; medium: number },
    userEmail?: string
) => {
    const doc = new jsPDF('landscape')
    const timestamp = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]

    doc.setFontSize(22)
    doc.setTextColor(41, 128, 185)
    doc.text('Audit Management System', 14, 22)
    doc.setFontSize(14)
    doc.setTextColor(100)
    doc.text('Internal Audit Findings Report', 14, 30)

    doc.setFontSize(10)
    doc.text(`Generated: ${timestamp}`, 14, 38)
    doc.text(`User: ${profile?.full_name || userEmail || 'Unknown'}`, 14, 43)

    doc.setDrawColor(200)
    doc.setFillColor(245, 247, 250)
    doc.rect(14, 50, 260, 25, 'F')
    doc.setTextColor(0)
    doc.setFontSize(11)
    doc.text('SUMMARY STATISTICS', 20, 58)
    doc.setFontSize(10)
    doc.text(`Total Findings: ${stats.total}  |  Critical: ${stats.critical}  |  High: ${stats.high}  |  Medium: ${stats.medium}`, 20, 68)

    const tableRows = filteredObservations.map((obs, index) => [
        index + 1,
        `${obs.audit_procedures?.framework_mapping?.framework_name} / ${obs.audit_procedures?.framework_mapping?.reference_code}`,
        obs.title || obs.condition.substring(0, 40) + '...',
        obs.condition.substring(0, 80) + (obs.condition.length > 80 ? '...' : ''),
        obs.risk_rating,
        obs.management_responses?.[0]?.status || 'Open',
        new Date(obs.created_at).toISOString().split('T')[0]
    ])

    autoTable(doc, {
        startY: 85,
        head: [['#', 'Reference', 'Title', 'Finding (Condition)', 'Risk', 'Status', 'Created']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 38 },
            2: { cellWidth: 50 },
            3: { cellWidth: 90 },
            4: { cellWidth: 18 },
            5: { cellWidth: 18 },
            6: { cellWidth: 22 }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                const rating = data.cell.raw as string
                if (rating === 'Critical') data.cell.styles.textColor = [239, 68, 68]
                if (rating === 'High') data.cell.styles.textColor = [248, 113, 113]
            }
        }
    })

    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Page ${i} of ${pageCount} - Confidential AuditAce Internal Report`, 14, 200)
    }

    doc.save(`AuditAce_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`)
}

export const generateDetailedPDF = (obs: Observation, profile: Profile | null, userEmail?: string) => {
    const doc = new jsPDF()
    const timestamp = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]

    doc.setFontSize(22)
    doc.setTextColor(41, 128, 185)
    doc.text('AuditAce: Detailed Finding Report', 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${timestamp}`, 14, 30)
    doc.text(`User: ${profile?.full_name || userEmail || 'Unknown'}`, 14, 35)

    doc.setDrawColor(41, 128, 185)
    doc.setLineWidth(0.5)
    doc.line(14, 40, 196, 40)

    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.setFont('helvetica', 'bold')
    doc.text('1. OVERVIEW', 14, 50)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Reference: ${obs.audit_procedures?.framework_mapping?.framework_name} / ${obs.audit_procedures?.framework_mapping?.reference_code}`, 14, 58)
    doc.text(`Procedure: ${obs.audit_procedures?.procedure_name}`, 14, 63)
    doc.text(`Category: ${obs.audit_procedures?.framework_mapping?.risk_categories?.category_name}`, 14, 68)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text('Title:', 14, 76)
    doc.setFont('helvetica', 'normal')
    const titleText = obs.title || obs.condition.substring(0, 80)
    doc.text(titleText, 14, 82, { maxWidth: 180 })

    const rating = obs.risk_rating
    doc.setFillColor(rating === 'Critical' ? 239 : rating === 'High' ? 248 : 251, rating === 'Critical' ? 68 : rating === 'High' ? 113 : 191, rating === 'Critical' ? 68 : rating === 'High' ? 113 : 36)
    doc.rect(150, 50, 45, 10, 'F')
    doc.setTextColor(255)
    doc.setFont('helvetica', 'bold')
    doc.text(`RISK: ${rating.toUpperCase()}`, 154, 56)

    doc.setTextColor(41, 128, 185)
    doc.setFontSize(14)
    doc.text('2. FINDING DETAILS (5C MODEL)', 14, 95)

    autoTable(doc, {
        startY: 100,
        body: [
            ['CONDITION', obs.condition],
            ['CRITERIA', obs.criteria],
            ['CAUSE', obs.cause || 'Not specified'],
            ['EFFECT', obs.effect || 'Not specified'],
            ['RECOMMENDATION', obs.recommendation || 'Not specified']
        ],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
            0: { cellWidth: 40, fontStyle: 'bold', fillColor: [245, 247, 250] },
            1: { cellWidth: 142 }
        }
    })

    const finalY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(14)
    doc.setTextColor(41, 128, 185)
    doc.text('3. MANAGEMENT ACTION PLAN', 14, finalY)

    if (obs.management_responses && obs.management_responses.length > 0) {
        const resp = obs.management_responses[0]
        autoTable(doc, {
            startY: finalY + 5,
            body: [
                ['RESPONSE', resp.management_response],
                ['ACTION PLAN', resp.action_plan],
                ['RESPONSIBLE', resp.responsible_person],
                ['TARGET DATE', resp.target_date],
                ['STATUS', resp.status]
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 4 },
            columnStyles: {
                0: { cellWidth: 40, fontStyle: 'bold', textColor: [100, 100, 100] },
                1: { cellWidth: 142 }
            }
        })
    } else {
        doc.setFontSize(10)
        doc.setTextColor(150)
        doc.setFont('helvetica', 'italic')
        doc.text('Pending management response...', 14, finalY + 10)
    }

    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Page ${i} of ${pageCount} - AuditAce Detailed Audit Report - ${obs.observation_id}`, 14, 285)
    }

    doc.save(`AuditAce_Detailed_Finding_${obs.observation_id.slice(0, 8)}.pdf`)
}

export const generateRiskRegisterPDF = (
    entries: any[], // Using any[] to avoid circular dependency or import issues if RiskRegisterEntry isn't readily available in types
    profile: Profile | null,
    fiscalYear: string,
    userEmail?: string
) => {
    const doc = new jsPDF('landscape')
    const timestamp = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]

    doc.setFontSize(22)
    doc.setTextColor(41, 128, 185)
    doc.text('Audit Management System', 14, 22)
    doc.setFontSize(14)
    doc.setTextColor(100)
    doc.text(`Risk Register Report - FY ${fiscalYear}`, 14, 30)

    doc.setFontSize(10)
    doc.text(`Generated: ${timestamp}`, 14, 38)
    doc.text(`User: ${profile?.full_name || userEmail || 'Unknown'}`, 14, 43)

    const tableRows = entries.map((entry, index) => [
        index + 1,
        entry.risk_title,
        entry.risk_description?.substring(0, 150) + (entry.risk_description?.length > 150 ? '...' : ''),
        (entry.control_description || entry.control_title || '').substring(0, 150) + '...',
        entry.risk_categories?.category_name || 'Uncategorized',
        entry.risk_owner || 'Unassigned',
        `${entry.inherent_likelihood * entry.inherent_impact}`,
        `${entry.residual_likelihood * entry.residual_impact}`
    ])

    autoTable(doc, {
        startY: 50,
        head: [['#', 'Risk Title', 'Risk Description', 'Control Description', 'Category', 'Owner', 'Inherent', 'Residual']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 40 }, // Risk Title
            2: { cellWidth: 70 }, // Risk Description
            3: { cellWidth: 70 }, // Control Description
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 25, halign: 'center' },
            6: { cellWidth: 15, halign: 'center' },
            7: { cellWidth: 15, halign: 'center' }
        }
    })

    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Page ${i} of ${pageCount} - Confidential AuditAce Risk Register`, 14, 200)
    }

    doc.save(`AuditAce_Risk_Register_${new Date().toISOString().split('T')[0]}.pdf`)
}
