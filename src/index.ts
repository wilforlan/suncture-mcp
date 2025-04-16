import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import express, { Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// Constants
const HEALTHGOV_API_BASE = "https://health.gov/myhealthfinder/api/v3";
const FDA_API_BASE = "https://api.fda.gov/drug";
const NIH_MED_API_BASE = "https://clinicaltables.nlm.nih.gov/api/conditions/v3/search";
const USER_AGENT = "healthcare-assistant/1.0";

// Server instance - exported for potential programmatic use
export const server = new McpServer({
    name: "suncture-healthcare",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

// Helper function for making API requests
async function makeApiRequest<T>(url: string): Promise<T | null> {
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

// Interfaces
interface HealthRecommendation {
    Title?: string;
    MyHFDescription?: string;
    MyHFCategoryIDs?: string[];
    PopulationData?: {
        PopulationGroup?: string;
    };
    RecommendationSummary?: string;
}

interface HealthGovResponse {
    Result?: {
        Resources?: {
            Resource?: HealthRecommendation[];
        };
    };
}

interface MedicationInfo {
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

interface FDAResponse {
    results?: MedicationInfo[];
}

interface DiseaseSymptom {
    name?: string;
    symptoms?: string[];
    overview?: string;
    treatment?: string;
    prevention?: string;
}

// Format health recommendation data
function formatHealthRecommendation(recommendation: HealthRecommendation): string {
    return [
        `Title: ${recommendation.Title || "Unknown"}`,
        `Target Population: ${recommendation.PopulationData?.PopulationGroup || "General population"}`,
        `Summary: ${recommendation.RecommendationSummary || "No summary available"}`,
        `Description: ${recommendation.MyHFDescription || "No description available"}`,
        "---",
    ].join("\n");
}

// Mock database for common diseases and symptoms
// In a real implementation, this would be connected to a medical API or database
const diseasesAndSymptoms: Record<string, DiseaseSymptom> = {
    "common cold": {
        name: "Common Cold",
        symptoms: ["Runny or stuffy nose", "Sore throat", "Cough", "Congestion", "Slight body aches", "Mild headache", "Sneezing", "Low-grade fever", "Generally feeling unwell"],
        overview: "The common cold is a viral infection of your nose and throat. It's usually harmless, although it might not feel that way. Many types of viruses can cause a common cold.",
        treatment: "There's no cure for the common cold. Antibiotics are of no use against cold viruses. Treatment includes rest, fluids, and over-the-counter medicines to relieve symptoms.",
        prevention: "Wash your hands frequently, avoid close contact with sick people, don't touch your face with unwashed hands, and strengthen your immune system with a healthy diet and exercise.",
    },
    "influenza": {
        name: "Influenza (Flu)",
        symptoms: ["Fever over 100.4°F (38°C)", "Aching muscles", "Chills and sweats", "Headache", "Dry, persistent cough", "Shortness of breath", "Tiredness and weakness", "Runny or stuffy nose", "Sore throat", "Eye pain", "Vomiting and diarrhea (more common in children)"],
        overview: "Influenza is a viral infection that attacks your respiratory system — your nose, throat and lungs. Influenza is commonly called the flu.",
        treatment: "Rest and fluids are essential. Antiviral medications may be prescribed to shorten the duration and reduce severity, especially for high-risk individuals.",
        prevention: "Annual flu vaccination, washing hands regularly, avoiding close contact with sick people, and maintaining good health habits.",
    },
    "hypertension": {
        name: "Hypertension (High Blood Pressure)",
        symptoms: ["Most people have no symptoms; a few may experience headaches", "Shortness of breath", "Nosebleeds", "Visual changes"],
        overview: "Hypertension is a common condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease.",
        treatment: "Lifestyle changes, including diet, exercise, stress management, and limiting alcohol and tobacco. Medications may be prescribed when lifestyle changes aren't enough.",
        prevention: "Maintain a healthy weight, exercise regularly, eat a diet rich in fruits, vegetables, and low-fat dairy, limit sodium intake, limit alcohol consumption, avoid smoking, and manage stress.",
    },
    "diabetes": {
        name: "Diabetes Mellitus",
        symptoms: ["Increased thirst", "Frequent urination", "Extreme hunger", "Unexplained weight loss", "Fatigue", "Irritability", "Blurred vision", "Slow-healing sores", "Frequent infections"],
        overview: "Diabetes is a disease that occurs when your blood glucose (blood sugar) is too high. Blood glucose is your main source of energy and comes from the food you eat. Insulin helps glucose get into your cells to be used for energy.",
        treatment: "Type 1 diabetes requires insulin therapy. Type 2 diabetes can be managed with lifestyle changes, oral medications, and sometimes insulin. Regular blood sugar monitoring is essential.",
        prevention: "Type 1 diabetes cannot be prevented. Type 2 diabetes can often be prevented or delayed by maintaining a healthy weight, engaging in regular physical activity, and eating a balanced diet.",
    },
    "asthma": {
        name: "Asthma",
        symptoms: ["Shortness of breath", "Chest tightness or pain", "Wheezing when exhaling", "Trouble sleeping caused by shortness of breath", "Coughing or wheezing attacks worsened by respiratory virus"],
        overview: "Asthma is a condition in which your airways narrow and swell and may produce extra mucus. This can make breathing difficult and trigger coughing, a whistling sound (wheezing) when you breathe out and shortness of breath.",
        treatment: "Long-term control and quick-relief medications, breathing exercises, and avoiding triggers. An asthma action plan is important for managing the condition.",
        prevention: "While there's no way to prevent asthma, you can reduce asthma attacks by avoiding triggers, getting vaccinated for influenza and pneumonia, and working with your doctor to identify and treat attacks early.",
    },
};

// Register healthcare tools
server.tool(
    "get-health-recommendations",
    "Get health screening and preventive care recommendations based on age, sex, and pregnancy status",
    {
        age: z.number().min(0).max(120).describe("Age of the person in years"),
        sex: z.enum(["male", "female"]).describe("Biological sex of the person"),
        pregnant: z.boolean().optional().describe("Whether the person is pregnant (only applicable for females)"),
    },
    async ({ age, sex, pregnant }) => {
        // Build the Health.gov API URL
        let apiUrl = `${HEALTHGOV_API_BASE}/myhealthfinder.json?age=${age}&sex=${sex}`;
        if (sex === "female" && pregnant !== undefined) {
            apiUrl += `&pregnant=${pregnant ? "true" : "false"}`;
        }
        
        const healthData = await makeApiRequest<HealthGovResponse>(apiUrl);

        if (!healthData || !healthData.Result || !healthData.Result.Resources || !healthData.Result.Resources.Resource) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to retrieve health recommendations data.",
                    },
                ],
            };
        }

        const recommendations = healthData.Result.Resources.Resource;
        if (recommendations.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No health recommendations found for a ${age}-year-old ${sex}.`,
                    },
                ],
            };
        }

        const formattedRecommendations = recommendations.map(formatHealthRecommendation);
        const recommendationsText = `Health recommendations for a ${age}-year-old ${sex}${pregnant ? " (pregnant)" : ""}:\n\n${formattedRecommendations.join("\n")}`;

        return {
            content: [
                {
                    type: "text",
                    text: recommendationsText,
                },
            ],
        };
    },
);

server.tool(
    "lookup-medication",
    "Look up information about a medication by name",
    {
        medicationName: z.string().describe("Name of the medication to look up (generic or brand name)"),
    },
    async ({ medicationName }) => {
        const encodedName = encodeURIComponent(medicationName);
        const apiUrl = `${FDA_API_BASE}/label.json?search=openfda.generic_name:"${encodedName}"+openfda.brand_name:"${encodedName}"&limit=1`;
        
        const medicationData = await makeApiRequest<FDAResponse>(apiUrl);

        if (!medicationData || !medicationData.results || medicationData.results.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No information found for medication: ${medicationName}. Please check the spelling or try a different medication name.`,
                    },
                ],
            };
        }

        const med = medicationData.results[0];
        const genericName = med.openfda?.generic_name?.[0] || "Not available";
        const brandNames = med.openfda?.brand_name?.join(", ") || "Not available";
        const manufacturers = med.openfda?.manufacturer_name?.join(", ") || "Not available";
        const routes = med.openfda?.route?.join(", ") || "Not available";
        const substances = med.openfda?.substance_name?.join(", ") || "Not available";
        
        const warnings = med.warnings?.[0] || "No warnings available";
        const dosage = med.dosage_and_administration?.[0] || "No dosage information available";
        const indications = med.indications_and_usage?.[0] || "No usage information available";
        const adverseReactions = med.adverse_reactions?.[0] || "No adverse reactions information available";
        const interactions = med.drug_interactions?.[0] || "No drug interactions information available";

        const medicationText = [
            `# Medication Information for ${genericName} (${brandNames})`,
            "",
            "## Basic Information",
            `Generic Name: ${genericName}`,
            `Brand Names: ${brandNames}`,
            `Manufacturer(s): ${manufacturers}`,
            `Administration Route(s): ${routes}`,
            `Active Substance(s): ${substances}`,
            "",
            "## Usage Information",
            `Indications and Usage: ${indications}`,
            "",
            "## Dosage Information",
            `${dosage}`,
            "",
            "## Safety Information",
            `Warnings: ${warnings}`,
            "",
            "## Adverse Reactions",
            `${adverseReactions}`,
            "",
            "## Drug Interactions",
            `${interactions}`,
            "",
            "DISCLAIMER: This information is for educational purposes only and is not a substitute for professional medical advice. Always consult with a healthcare provider before taking any medication.",
        ].join("\n");

        return {
            content: [
                {
                    type: "text",
                    text: medicationText,
                },
            ],
        };
    },
);

server.tool(
    "find-disease-info",
    "Find information about a disease or medical condition",
    {
        condition: z.string().describe("Name of the disease or medical condition to look up"),
    },
    async ({ condition }) => {
        // Normalize the condition name for lookup
        const normalizedCondition = condition.toLowerCase().trim();
        
        // First, check our local database for common conditions
        for (const [key, diseaseInfo] of Object.entries(diseasesAndSymptoms)) {
            if (key.includes(normalizedCondition) || normalizedCondition.includes(key)) {
                const diseaseText = [
                    `# ${diseaseInfo.name}`,
                    "",
                    "## Overview",
                    `${diseaseInfo.overview}`,
                    "",
                    "## Symptoms",
                    `${diseaseInfo.symptoms?.map(s => `- ${s}`).join("\n") || "No symptom information available."}`,
                    "",
                    "## Treatment",
                    `${diseaseInfo.treatment}`,
                    "",
                    "## Prevention",
                    `${diseaseInfo.prevention}`,
                    "",
                    "DISCLAIMER: This information is for educational purposes only and is not a substitute for professional medical advice.",
                ].join("\n");

                return {
                    content: [
                        {
                            type: "text",
                            text: diseaseText,
                        },
                    ],
                };
            }
        }
        
        // If not found in our database, attempt to query the NIH API
        const encodedCondition = encodeURIComponent(normalizedCondition);
        const apiUrl = `${NIH_MED_API_BASE}?terms=${encodedCondition}&maxList=1`;
        
        try {
            const conditionData = await makeApiRequest<[number, string[], any[], string[]]>(apiUrl);
            
            if (!conditionData || conditionData[0] === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `No information found for the condition: ${condition}. Please check the spelling or try a different medical condition.`,
                        },
                    ],
                };
            }
            
            // The API just gives us names, so we'll provide a general response
            const conditionName = conditionData[3][0] || condition;
            
            const conditionText = [
                `# ${conditionName}`,
                "",
                "I found this condition in the medical database, but detailed information is limited.",
                "",
                "## General Advice",
                "For specific information about this condition, including symptoms, diagnosis, treatment options, and prevention strategies, please consult with a healthcare provider.",
                "",
                "## Next Steps",
                "- Consider scheduling an appointment with your primary care physician to discuss this condition",
                "- Before your appointment, write down any symptoms you're experiencing and how long you've had them",
                "- Make a list of all medications, vitamins, and supplements you're taking",
                "- Prepare a list of questions to ask your doctor",
                "",
                "DISCLAIMER: This information is for educational purposes only and is not a substitute for professional medical advice.",
            ].join("\n");

            return {
                content: [
                    {
                        type: "text",
                        text: conditionText,
                    },
                ],
            };
        } catch (error) {
            console.error("Error querying condition API:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `Unable to retrieve information for: ${condition}. Please try again later or consult with a healthcare provider.`,
                    },
                ],
            };
        }
    },
);

server.tool(
    "calculate-bmi",
    "Calculate Body Mass Index (BMI) and provide health recommendations",
    {
        weight: z.number().min(1).describe("Weight in kilograms"),
        height: z.number().min(0.1).describe("Height in meters"),
        age: z.number().min(0).max(120).optional().describe("Age in years (optional)"),
        sex: z.enum(["male", "female"]).optional().describe("Biological sex (optional)"),
    },
    async ({ weight, height, age, sex }) => {
        // Calculate BMI: weight (kg) / (height (m) * height (m))
        const bmi = weight / (height * height);
        const roundedBmi = Math.round(bmi * 10) / 10;

        // Determine BMI category
        let category, healthRisk, basicRecommendation;
        
        if (bmi < 18.5) {
            category = "Underweight";
            healthRisk = "Malnutrition, vitamin deficiencies, anemia";
            basicRecommendation = "Consider consulting with a healthcare provider about healthy weight gain strategies and nutritional assessment.";
        } else if (bmi >= 18.5 && bmi < 25) {
            category = "Normal weight";
            healthRisk = "Low risk (healthy range)";
            basicRecommendation = "Maintain healthy eating habits and regular physical activity.";
        } else if (bmi >= 25 && bmi < 30) {
            category = "Overweight";
            healthRisk = "Moderate risk of developing heart disease, high blood pressure, stroke, diabetes";
            basicRecommendation = "Consider gradual weight loss through improved diet and increased physical activity.";
        } else if (bmi >= 30 && bmi < 35) {
            category = "Obesity (Class 1)";
            healthRisk = "High risk of developing heart disease, high blood pressure, stroke, diabetes";
            basicRecommendation = "Consult with a healthcare provider about a weight management plan.";
        } else if (bmi >= 35 && bmi < 40) {
            category = "Obesity (Class 2)";
            healthRisk = "Very high risk of developing heart disease, high blood pressure, stroke, diabetes";
            basicRecommendation = "Strongly recommended to consult with a healthcare provider about a weight management plan.";
        } else {
            category = "Obesity (Class 3)";
            healthRisk = "Extremely high risk of developing heart disease, high blood pressure, stroke, diabetes";
            basicRecommendation = "Urgent consultation with a healthcare provider is recommended.";
        }

        // Additional recommendations based on age and sex
        let additionalRecommendations = "";
        if (age !== undefined && sex !== undefined) {
            if (age >= 45 && sex === "male") {
                additionalRecommendations += "\n\nFor men over 45: Consider regular screening for heart disease and diabetes, especially if your BMI is above the normal range.";
            } else if (age >= 55 && sex === "female") {
                additionalRecommendations += "\n\nFor women over 55: Consider bone density screening, especially if your BMI is in the underweight range, as low body weight can be a risk factor for osteoporosis.";
            }
            
            if (age >= 65) {
                additionalRecommendations += "\n\nFor adults over 65: BMI calculations may be less accurate. Maintaining muscle mass becomes increasingly important. Consider consulting with a healthcare provider about appropriate weight and nutrition goals.";
            }
        }

        const bmiText = [
            `# BMI Calculation Results`,
            "",
            `Your BMI: ${roundedBmi}`,
            `Category: ${category}`,
            `Potential Health Risks: ${healthRisk}`,
            "",
            "## Recommendations",
            basicRecommendation,
            additionalRecommendations,
            "",
            "## BMI Limitations",
            "BMI is a simple screening tool and does not directly measure body fat or account for factors like muscle mass, bone density, overall body composition, or ethnic differences.",
            "Athletes or highly muscular individuals may have a high BMI without excess fat.",
            "",
            "DISCLAIMER: This information is for educational purposes only and is not a substitute for professional medical advice.",
        ].join("\n");

        return {
            content: [
                {
                    type: "text",
                    text: bmiText,
                },
            ],
        };
    },
);

server.tool(
    "symptom-checker",
    "Check common symptoms and get preliminary advice",
    {
        symptoms: z.array(z.string()).min(1).describe("List of symptoms the person is experiencing"),
        duration: z.enum(["hours", "days", "weeks", "months"]).describe("How long the symptoms have been present"),
        severity: z.enum(["mild", "moderate", "severe"]).describe("How severe the symptoms are"),
        age: z.number().min(0).max(120).describe("Age of the person in years"),
        sex: z.enum(["male", "female"]).describe("Biological sex of the person"),
    },
    async ({ symptoms, duration, severity, age }) => {
        // Normalize symptoms to lowercase for matching
        const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());
        
        // Check for emergency symptoms that require immediate medical attention
        const emergencySymptoms = [
            "chest pain", "shortness of breath", "difficulty breathing", 
            "sudden numbness", "paralysis", "difficulty speaking", 
            "sudden severe headache", "head injury", "uncontrollable bleeding",
            "severe abdominal pain", "coughing up blood", "vomiting blood",
            "suicidal thoughts", "seizure", "unconsciousness", "severe burn"
        ];
        
        for (const symptom of normalizedSymptoms) {
            for (const emergencySymptom of emergencySymptoms) {
                if (symptom.includes(emergencySymptom)) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "⚠️ EMERGENCY WARNING ⚠️\n\nThe symptoms you've described may indicate a serious medical condition requiring immediate attention. Please call emergency services (911 in the US) or go to the nearest emergency room immediately.\n\nThis tool cannot provide emergency medical advice or replace professional medical care.",
                            },
                        ],
                    };
                }
            }
        }
        
        // Map common symptoms to potential conditions
        const symptomToConditionMap: Record<string, string[]> = {
            "fever": ["common cold", "influenza", "covid-19", "infection"],
            "cough": ["common cold", "influenza", "covid-19", "asthma", "allergies"],
            "headache": ["tension headache", "migraine", "dehydration", "stress", "influenza"],
            "fatigue": ["depression", "anemia", "sleep disorder", "influenza", "hypothyroidism"],
            "sore throat": ["common cold", "influenza", "strep throat", "allergies"],
            "runny nose": ["common cold", "allergies", "influenza"],
            "stuffy nose": ["common cold", "allergies", "influenza"],
            "body aches": ["influenza", "fibromyalgia", "common cold"],
            "nausea": ["food poisoning", "migraine", "anxiety", "pregnancy", "motion sickness"],
            "vomiting": ["food poisoning", "gastroenteritis", "migraine", "pregnancy"],
            "diarrhea": ["food poisoning", "gastroenteritis", "irritable bowel syndrome"],
            "rash": ["allergic reaction", "eczema", "psoriasis", "chickenpox", "contact dermatitis"],
            "abdominal pain": ["gastroenteritis", "appendicitis", "irritable bowel syndrome", "menstrual cramps"],
            "joint pain": ["arthritis", "injury", "influenza", "lyme disease", "gout"],
            "dizziness": ["vertigo", "inner ear infection", "anemia", "dehydration", "anxiety"],
            "chest tightness": ["asthma", "anxiety", "pneumonia", "bronchitis"],
            "sneezing": ["common cold", "allergies", "influenza"],
            "wheezing": ["asthma", "bronchitis", "allergic reaction"],
            "itching": ["allergic reaction", "eczema", "psoriasis", "contact dermatitis"],
            "swelling": ["injury", "allergic reaction", "infection", "arthritis"],
            "shortness of breath": ["asthma", "anxiety", "pneumonia", "bronchitis", "covid-19"],
            "back pain": ["muscle strain", "herniated disc", "arthritis", "kidney infection"],
            "high blood pressure": ["hypertension", "anxiety", "pre-eclampsia"],
            "high blood sugar": ["diabetes", "prediabetes"],
        };
        
        // Match symptoms to conditions
        const potentialConditions: Record<string, number> = {};
        
        for (const symptom of normalizedSymptoms) {
            // Check for exact matches first
            const exactMatches = symptomToConditionMap[symptom];
            if (exactMatches) {
                for (const condition of exactMatches) {
                    potentialConditions[condition] = (potentialConditions[condition] || 0) + 2; // Give more weight to exact matches
                }
                continue;
            }
            
            // Check for partial matches
            for (const [knownSymptom, conditions] of Object.entries(symptomToConditionMap)) {
                if (symptom.includes(knownSymptom) || knownSymptom.includes(symptom)) {
                    for (const condition of conditions) {
                        potentialConditions[condition] = (potentialConditions[condition] || 0) + 1;
                    }
                }
            }
        }
        
        // Sort conditions by number of matching symptoms
        const sortedConditions = Object.entries(potentialConditions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);
        
        // Generate advice based on symptoms, duration, severity, age, and sex
        let generalAdvice;
        let whenToSeekCare;
        
        if (severity === "mild" && (duration === "hours" || duration === "days")) {
            generalAdvice = "Your symptoms appear to be mild and recent. Rest, stay hydrated, and monitor your symptoms. Over-the-counter medications may help relieve discomfort.";
            whenToSeekCare = "If symptoms worsen, persist beyond a week, or if you develop fever above 101°F (38.3°C), difficulty breathing, or severe pain, consult a healthcare provider.";
        } else if (severity === "mild" && (duration === "weeks" || duration === "months")) {
            generalAdvice = "While your symptoms are mild, the extended duration suggests you should consult with a healthcare provider for proper evaluation.";
            whenToSeekCare = "Schedule an appointment with your primary care provider within the next week.";
        } else if (severity === "moderate" && (duration === "hours" || duration === "days")) {
            generalAdvice = "Your symptoms are moderately concerning. Rest, stay hydrated, and consider over-the-counter medications for symptom relief if appropriate.";
            whenToSeekCare = "If symptoms don't improve within 2-3 days or worsen at any time, consult with a healthcare provider promptly.";
        } else if (severity === "moderate" && (duration === "weeks" || duration === "months")) {
            generalAdvice = "The combination of moderate symptoms lasting this long indicates you should seek medical evaluation.";
            whenToSeekCare = "Please schedule an appointment with your healthcare provider within the next few days.";
        } else if (severity === "severe") {
            generalAdvice = "Your symptoms are severe, which is concerning regardless of duration.";
            whenToSeekCare = "Please seek medical attention promptly. Contact your healthcare provider today or visit an urgent care facility if you can't get a same-day appointment.";
        }
        
        // Age-specific considerations
        if (age < 2) {
            whenToSeekCare = "For infants under 2 years, even mild symptoms should be evaluated by a pediatrician promptly.";
        } else if (age >= 65) {
            whenToSeekCare = "Adults over 65 should take symptoms more seriously as complications can develop more quickly. Consider consulting with your healthcare provider even for mild symptoms that persist.";
        }
        
        // Generate response
        const symptomsText = normalizedSymptoms.join(", ");
        const conditionsText = sortedConditions.length > 0 
            ? `Based on the symptoms you've described, possible conditions might include: ${sortedConditions.join(", ")}.` 
            : "Based on the limited information provided, I cannot identify specific potential conditions that match your symptoms.";
        
        const responseText = [
            `# Symptom Assessment`,
            "",
            `## Summary`,
            `You reported ${normalizedSymptoms.length} symptom(s): ${symptomsText}`,
            `Duration: ${duration}`,
            `Severity: ${severity}`,
            "",
            `## Possible Conditions`,
            conditionsText,
            "",
            `## General Advice`,
            generalAdvice,
            "",
            `## When to Seek Medical Care`,
            whenToSeekCare,
            "",
            "IMPORTANT DISCLAIMER: This tool provides general information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.",
            "",
            "The assessment provided is based on the limited information you've shared and does not constitute a medical diagnosis. Only a healthcare provider can provide an accurate diagnosis after proper examination.",
        ].join("\n");
        
        return {
            content: [
                {
                    type: "text",
                    text: responseText,
                },
            ],
        };
    },
);

/**
 * Run the MCP server
 * @param options Optional server configuration options
 * @returns A promise that resolves when the server is running
 */
export async function runServer(options?: {
    mode?: string;
    port?: number;
    endpoint?: string;
}): Promise<void> {
    // Get configuration from options or environment variables
    const mode = options?.mode || process.env.MCP_MODE || "sse";
    const port = options?.port || parseInt(process.env.MCP_PORT || "3001");
    const endpoint = options?.endpoint || process.env.MCP_ENDPOINT || "/sse";

    try {
        // Check if mode is SSE and set up SSE server
        if (mode === "sse") {
            try {
                console.error(`Setting up SSE server on port ${port} with endpoint ${endpoint}`);
                const app = express();
                const transportMap = new Map<string, SSEServerTransport>();

                app.get(endpoint, async (req: Request, res: Response) => {
                    console.error(`Received SSE connection request from ${req.ip}`);
                    // Create the full URL for messages endpoint
                    const messagesUrl = `/messages`;
                    console.error(`Creating SSE transport with messagesUrl=${messagesUrl}`);
                    const transport = new SSEServerTransport(messagesUrl, res);
                    console.error(`Created SSE transport with sessionId=${transport.sessionId}`);
                    transportMap.set(transport.sessionId, transport);
                    await server.connect(transport);
                    console.error(`Connected transport with sessionId=${transport.sessionId} to MCP server`);
                });

                app.post("/messages", (req: Request, res: Response) => {
                    const sessionId = req.query.sessionId as string;
                    console.error(`Received message for sessionId=${sessionId}`);
                    if (!sessionId) {
                        console.error('Message received without sessionId');
                        res.status(400).json({ error: 'sessionId is required' });
                        return;
                    }

                    const transport = transportMap.get(sessionId);
                    if (transport) {
                        console.error(`Found transport for sessionId=${sessionId}, handling message`);
                        transport.handlePostMessage(req, res);
                    } else {
                        console.error(`No transport found for sessionId=${sessionId}`);
                        res.status(404).json({ error: 'Session not found' });
                    }
                });

                app.listen(port, () => {
                    console.error(`Healthcare MCP Server running in SSE mode on port ${port} with endpoint ${endpoint}`);
                    console.error(`SSE URL: http://localhost:${port}${endpoint}`);
                    console.error(`Messages URL: http://localhost:${port}/messages`);
                });
                return;
            } catch (error) {
                console.error("Failed to initialize SSE transport:", error);
                console.error("Falling back to stdio mode.");
                // Fall back to stdio mode if SSE transport is not available
            }
        }
        // Check if mode is REST (legacy support)
        else if (mode === "rest") {
            try {
                // Dynamically import the REST transport module
                const { RestServerTransport } = await import("@chatmcp/sdk/server/rest.js");
                
                const transport = new RestServerTransport({
                    port,
                    endpoint,
                });
                await server.connect(transport);
                await transport.startServer();
                console.error(`Healthcare MCP Server running in REST mode on port ${port} with endpoint ${endpoint}`);
                return;
            } catch (error) {
                console.error("Failed to initialize REST transport. Falling back to stdio mode.", error);
                // Fall back to stdio mode if REST transport is not available
            }
        }

        // Default to stdio mode
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("Healthcare MCP Server running on stdio");
    } catch (error) {
        console.error("Fatal error running server:", error);
        throw error; // Rethrow to allow calling code to handle errors
    }
}

// Auto-run the server if this file is executed directly (not imported as a module)
if (import.meta.url === `file://${process.argv[1]}`) {
    runServer().catch((error) => {
        console.error("Fatal error in main():", error);
        process.exit(1);
    });
}