// Constants for API endpoints
export const HEALTHGOV_API_BASE = "https://health.gov/myhealthfinder/api/v3";
export const FDA_API_BASE = "https://api.fda.gov/drug";
export const NIH_MED_API_BASE = "https://clinicaltables.nlm.nih.gov/api/conditions/v3/search";
export const USER_AGENT = "healthcare-assistant/1.0";

// Helper function for making API requests
export async function makeApiRequest<T>(url: string): Promise<T | null> {
    const headers = {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as T;
    } catch (error) {
        console.error("Error making API request:", error);
        return null;
    }
}

// Format health recommendation data
export function formatHealthRecommendation(recommendation: any): string {
    return [
        `Title: ${recommendation.Title || "Unknown"}`,
        `Target Population: ${recommendation.PopulationData?.PopulationGroup || "General population"}`,
        `Summary: ${recommendation.RecommendationSummary || "No summary available"}`,
        `Description: ${recommendation.MyHFDescription || "No description available"}`,
        "---",
    ].join("\n");
} 