import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import "jheat.js/dist/heat.js.css";
import "jheat.js";

declare global {
    interface Window {
        $heat: any;
    }
}

interface ActivityHeatmapProps {
    dates: Date[];
}

/**
 * Computes dynamic color-range parameters from actual commit data.
 *
 * The goal is to make even small differences visible:
 * - startMinimum = 1 (any commit lights up)
 * - maximumMinimum = max commits on any single day
 * - totalColors = number of distinct color steps (2–5), clamped to the range
 *
 * For very small ranges (max 1–2) we still get meaningful coloring,
 * and for larger ranges we cap at 5 steps so the gradient stays readable.
 */
function computeColorRange(dates: Date[]) {
    if (dates.length === 0) {
        return { startMinimum: 1, maximumMinimum: 1, totalColors: 1 };
    }

    // Count commits per calendar day
    const countsPerDay: Record<string, number> = {};
    for (const d of dates) {
        const key = d.toISOString().slice(0, 10);
        countsPerDay[key] = (countsPerDay[key] ?? 0) + 1;
    }

    const values = Object.values(countsPerDay);
    const maxPerDay = Math.max(...values);
    const minPerDay = Math.min(...values);

    // Range of distinct daily counts
    const range = maxPerDay - minPerDay;

    // Determine color steps:
    //   - If all days have the same count → 1 step
    //   - If range is small (1–4) → use the range + 1 so each count gets its own color
    //   - Otherwise cap at 5 for readability
    const totalColors = range === 0 ? 1 : Math.min(range + 1, 5);

    // startMinimum = 1 so any commit is colored
    // maximumMinimum = max so the darkest color = busiest day
    return {
        startMinimum: 1,
        maximumMinimum: Math.max(maxPerDay, 2), // at least 2 to avoid jheat edge case
        totalColors: Math.max(totalColors, 2),   // at least 2 to show a gradient
    };
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ dates }) => {
    const { t, i18n } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const heatmapIdRef = useRef<string | null>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || !window.$heat) return;

        // Clean up previous instance
        if (heatmapIdRef.current) {
            try {
                window.$heat.destroy(heatmapIdRef.current);
            } catch {
                // ignore
            }
            el.innerHTML = "";
        }

        // Generate a stable unique ID
        const id = `heatmap-${Math.random().toString(36).substring(2, 10)}`;
        el.id = id;
        heatmapIdRef.current = id;

        const { startMinimum, maximumMinimum, totalColors } = computeColorRange(dates);

        // Render heatmap with options
        window.$heat.render(el, {
            title: {
                text: t("ProjectStatsPage.heatmapTitle"),
                showConfigurationButton: false,
            },
            views: {
                map: {
                    showDayNames: true,
                    showMonthNames: true,
                },
            },
            toolbar: {
                showNavigationButtons: true,
            },
            dynamicColorRange: {
                enabled: true,
                startMinimum,
                maximumMinimum,
                totalColors,
            },
        });

        // Add all commit dates
        if (dates.length > 0) {
            window.$heat.addDates(id, dates, "Commits", true);
        }

        return () => {
            if (heatmapIdRef.current && window.$heat) {
                try {
                    window.$heat.destroy(heatmapIdRef.current);
                } catch {
                    // ignore
                }
            }
            if (el) el.innerHTML = "";
            heatmapIdRef.current = null;
        };
    }, [dates, i18n.language]);

    return (
        <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {t("ProjectStatsPage.heatmapTitle")}
            </Typography>
            <Box
                ref={containerRef}
                sx={{
                    overflowX: "auto",
                    "& .heat-js": {
                        borderRadius: "8px",
                    },
                }}
            />
        </Box>
    );
};

export default ActivityHeatmap;
