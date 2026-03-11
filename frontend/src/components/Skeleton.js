import React from 'react';
import './Skeleton.css';

export function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-img shimmer" />
            <div className="skeleton-body">
                <div className="skeleton-line shimmer wide" />
                <div className="skeleton-line shimmer medium" />
                <div className="skeleton-line shimmer short" />
                <div className="skeleton-btn shimmer" />
            </div>
        </div>
    );
}

export function SkeletonList({ count = 4 }) {
    return (
        <div className="skeleton-grid">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export default SkeletonList;
