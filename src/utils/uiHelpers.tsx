import React from 'react';

export const getRatingBadge = (rating: string) => {
    const r = rating.toLowerCase();
    return <span className={`badge badge-${r}`}>{rating}</span>;
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0];
};

export const getScoreColor = (score: number) => {
    if (score >= 20) return '#dc2626';
    if (score >= 12) return '#f59e0b';
    if (score >= 8) return '#10b981';
    return '#3b82f6';
};
