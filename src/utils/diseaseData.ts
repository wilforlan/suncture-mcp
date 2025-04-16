import { DiseaseSymptom } from '../types/index.js';

// Mock database for common diseases and symptoms
// In a real implementation, this would be connected to a medical API or database
export const diseasesAndSymptoms: Record<string, DiseaseSymptom> = {
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