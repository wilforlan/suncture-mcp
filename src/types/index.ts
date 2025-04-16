// Interfaces for the healthcare API responses and data types

export interface HealthRecommendation {
    Title?: string;
    MyHFDescription?: string;
    MyHFCategoryIDs?: string[];
    PopulationData?: {
        PopulationGroup?: string;
    };
    RecommendationSummary?: string;
}

export interface HealthGovResponse {
    Result?: {
        Resources?: {
            Resource?: HealthRecommendation[];
        };
    };
}

export interface MedicationInfo {
    openfda?: {
        generic_name?: string[];
        brand_name?: string[];
        manufacturer_name?: string[];
        route?: string[];
        substance_name?: string[];
    };
    warnings?: string[];
    dosage_and_administration?: string[];
    indications_and_usage?: string[];
    adverse_reactions?: string[];
    drug_interactions?: string[];
}

export interface FDAResponse {
    results?: MedicationInfo[];
}

export interface DiseaseSymptom {
    name?: string;
    symptoms?: string[];
    overview?: string;
    treatment?: string;
    prevention?: string;
}

// Server configuration options
export interface ServerOptions {
    mode?: string;
    port?: number;
    endpoint?: string;
} 