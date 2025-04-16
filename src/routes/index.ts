import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create router
const router = express.Router();

// Root endpoint with landing page
router.get("/", (req: Request, res: Response) => {
    // Try to read the tailwind CSS file
    let tailwindCss = "";
    try {
        const cssPath = path.join(__dirname, "../../src/public/tailwind.css");
        tailwindCss = fs.readFileSync(cssPath, "utf8");
    } catch (error) {
        console.error("Could not load tailwind styles:", error);
    }

    const landingPage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Suncture Healthcare MCP</title>
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=outer-sans@1,800,500,400,700,600&display=swap">
        <link rel="stylesheet" href="/tailwind.css">
        <style>
            ${tailwindCss}
        </style>
    </head>
    <body class="bg-gray-50 text-secondary-900 font-sans">
        <header class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="flex justify-between items-center">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <h1 class="text-3xl font-bold text-secondary-900">@</h1>
                        </div>
                        <div class="ml-4">
                            <h1 class="text-3xl font-bold text-secondary-900">Suncture Healthcare</h1>
                            <p class="text-secondary-600">Model Context Protocol Server</p>
                        </div>
                    </div>
                    <div>
                        <a href="https://suncture.io" target="_blank" class="mt-6 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
                            <span class="flex items-center">
                                Try it out
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <!-- Hero section -->
            <div class="bg-white rounded-2xl shadow-soft overflow-hidden mb-16">
                <div class="grid md:grid-cols-2 gap-8">
                    <div class="p-8 md:p-12 flex flex-col justify-center">
                        <h2 class="text-4xl font-bold text-secondary-900 mb-6">Advanced Healthcare Tools for AI Assistants</h2>
                        <p class="text-lg text-secondary-700 mb-8">Enhance your AI models with specialized healthcare capabilities, delivering accurate and valuable medical information to users.</p>
                        <div>
                            <a href="#tools" class="btn btn-primary">Explore Healthcare Tools</a>
                        </div>
                    </div>
                    <div class="bg-primary-50 p-8 md:p-12 flex items-center justify-center">
                        <div class="rounded-xl bg-white shadow-soft p-6 w-full max-w-md">
                            <div class="flex items-center mb-4">
                                <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-4">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-lg">Server Status</h3>
                                    <p class="text-sm text-secondary-600">Running at <code>${req.protocol}://${req.get('host')}</code></p>
                                </div>
                            </div>
                            <div class="border-t border-gray-200 pt-4 mt-4">
                                <div class="flex justify-between mb-2">
                                    <span class="text-secondary-600">Server Name</span>
                                    <span class="font-medium">suncture-healthcare</span>
                                </div>
                                <div class="flex justify-between mb-2">
                                    <span class="text-secondary-600">Version</span>
                                    <span class="font-medium">1.0.0</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-secondary-600">Transport Type</span>
                                    <span class="font-medium">SSE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Benefits section -->
            <section class="mb-16">
                <h2 class="text-3xl font-bold text-secondary-900 mb-8">Key Benefits</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="card card-hover">
                        <div class="rounded-full w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 mb-4">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-3">Enhanced Healthcare Capabilities</h3>
                        <p class="text-secondary-700">Extend AI assistants with specialized tools, providing accurate and detailed medical information.</p>
                    </div>
                    <div class="card card-hover">
                        <div class="rounded-full w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 mb-4">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-3">Expert Knowledge</h3>
                        <p class="text-secondary-700">Access medical databases and resources with vetted, reliable healthcare information.</p>
                    </div>
                    <div class="card card-hover">
                        <div class="rounded-full w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 mb-4">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-3">User-Friendly Integration</h3>
                        <p class="text-secondary-700">Simple integration through the Model Context Protocol makes implementation straightforward.</p>
                    </div>
                    <div class="card card-hover">
                        <div class="rounded-full w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 mb-4">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-3">Secure & Private</h3>
                        <p class="text-secondary-700">Built with strong security protocols to maintain privacy of health-related queries.</p>
                    </div>
                </div>
            </section>

            <!-- Tools section -->
            <section id="tools" class="mb-16">
                <h2 class="text-3xl font-bold text-secondary-900 mb-8">Available Healthcare Tools</h2>
                
                <div class="space-y-6">
                    <div class="card overflow-hidden border border-primary-100">
                        <div class="bg-primary-50 p-6 border-b border-primary-100">
                            <div class="flex items-center">
                                <div class="rounded-full w-10 h-10 flex items-center justify-center bg-primary-600 text-white mr-4">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-semibold">Health Recommendations</h3>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="mb-4">Get personalized health screening and preventive care recommendations based on age, sex, and pregnancy status.</p>
                            <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto">
                                <pre class="whitespace-pre-wrap">Tool: get-health-recommendations
Parameters:
- age: number (0-120)
- sex: "male" | "female"
- pregnant: boolean (optional)</pre>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card overflow-hidden border border-primary-100">
                        <div class="bg-primary-50 p-6 border-b border-primary-100">
                            <div class="flex items-center">
                                <div class="rounded-full w-10 h-10 flex items-center justify-center bg-primary-600 text-white mr-4">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-semibold">Medication Information</h3>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="mb-4">Look up detailed information about medications, including usage, dosage, warnings, and side effects.</p>
                            <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto">
                                <pre class="whitespace-pre-wrap">Tool: lookup-medication
Parameters:
- medicationName: string</pre>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card overflow-hidden border border-primary-100">
                        <div class="bg-primary-50 p-6 border-b border-primary-100">
                            <div class="flex items-center">
                                <div class="rounded-full w-10 h-10 flex items-center justify-center bg-primary-600 text-white mr-4">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-semibold">Disease & Condition Information</h3>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="mb-4">Find information about various diseases and medical conditions, including symptoms, treatments, and prevention.</p>
                            <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto">
                                <pre class="whitespace-pre-wrap">Tool: find-disease-info
Parameters:
- condition: string</pre>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card overflow-hidden border border-primary-100">
                        <div class="bg-primary-50 p-6 border-b border-primary-100">
                            <div class="flex items-center">
                                <div class="rounded-full w-10 h-10 flex items-center justify-center bg-primary-600 text-white mr-4">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-semibold">BMI Calculator</h3>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="mb-4">Calculate Body Mass Index (BMI) and receive health recommendations based on the results.</p>
                            <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto">
                                <pre class="whitespace-pre-wrap">Tool: calculate-bmi
Parameters:
- weight: number (in kg)
- height: number (in meters)
- age: number (optional)
- sex: "male" | "female" (optional)</pre>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card overflow-hidden border border-primary-100">
                        <div class="bg-primary-50 p-6 border-b border-primary-100">
                            <div class="flex items-center">
                                <div class="rounded-full w-10 h-10 flex items-center justify-center bg-primary-600 text-white mr-4">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-semibold">Symptom Checker</h3>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="mb-4">Check common symptoms and receive preliminary advice on potential conditions and when to seek care.</p>
                            <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto">
                                <pre class="whitespace-pre-wrap">Tool: symptom-checker
Parameters:
- symptoms: string[]
- duration: "hours" | "days" | "weeks" | "months"
- severity: "mild" | "moderate" | "severe"
- age: number
- sex: "male" | "female"</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Integration section -->
            <section class="mb-16">
                <h2 class="text-3xl font-bold text-secondary-900 mb-8">Integration Guide</h2>
                <div class="card">
                    <p class="mb-6">To integrate the Suncture Healthcare MCP with your AI application:</p>
                    <div class="space-y-6">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-700 font-bold text-lg">1</div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-semibold mb-2">Connect to the SSE endpoint</h3>
                                <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto">
                                    <code>${req.protocol}://${req.get('host')}/sse</code>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-700 font-bold text-lg">2</div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-semibold mb-2">Send messages to the messages endpoint</h3>
                                <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto">
                                    <code>${req.protocol}://${req.get('host')}/messages?sessionId=[SESSION_ID]</code>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <div class="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-700 font-bold text-lg">3</div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-semibold mb-2">Use any or the standard MCP client library</h3>
                                <p class="text-secondary-700">For simplified integration, use the Model Context Protocol client library in your application.</p>
                                <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm mt-2 overflow-auto">
                                    <code>npm install @modelcontextprotocol/sdk</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Server information section -->
            <section>
                <h2 class="text-3xl font-bold text-secondary-900 mb-8">Server Information</h2>
                <div class="bg-white rounded-xl shadow-soft overflow-hidden">
                    <div class="border-b border-gray-200">
                        <div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
                            <div class="p-6">
                                <div class="text-sm text-secondary-600 mb-1">Server Name</div>
                                <div class="font-semibold">suncture-healthcare</div>
                            </div>
                            <div class="p-6">
                                <div class="text-sm text-secondary-600 mb-1">Version</div>
                                <div class="font-semibold">1.0.0</div>
                            </div>
                            <div class="p-6">
                                <div class="text-sm text-secondary-600 mb-1">Transport Type</div>
                                <div class="font-semibold">SSE</div>
                            </div>
                            <div class="p-6">
                                <div class="text-sm text-secondary-600 mb-1">Status</div>
                                <div class="flex items-center">
                                    <div class="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                                    <span class="font-semibold">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="mb-4">
                            <div class="text-sm text-secondary-600 mb-1">SSE Endpoint</div>
                            <div class="font-mono text-sm bg-gray-50 p-2 rounded">
                                ${req.protocol}://${req.get('host')}/sse
                            </div>
                        </div>
                        <div>
                            <div class="text-sm text-secondary-600 mb-1">Messages Endpoint</div>
                            <div class="font-mono text-sm bg-gray-50 p-2 rounded">
                                ${req.protocol}://${req.get('host')}/messages
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <footer class="bg-white border-t border-gray-200 mt-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div class="md:flex md:items-center md:justify-between">
                    <div class="flex items-center">
                        <svg class="h-8 w-8 text-primary-600" viewBox="0 0 40 40" fill="currentColor">
                            <path d="M20 3.33331C10.8 3.33331 3.33337 10.8 3.33337 20C3.33337 29.2 10.8 36.6666 20 36.6666C29.2 36.6666 36.6667 29.2 36.6667 20C36.6667 10.8 29.2 3.33331 20 3.33331Z"/>
                        </svg>
                        <p class="ml-3 text-secondary-600">© ${new Date().getFullYear()} Suncture Corp (suncture.io). All rights reserved.</p>
                    </div>
                    <div class="mt-8 md:mt-0">
                        <p class="text-secondary-600 text-sm">
                            This tool provides general health information for educational purposes only and is not a substitute for professional medical advice.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    </body>
    </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(landingPage);
});

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
    res.json({
        status: "ok",
        serverMode: "sse",
        sseEndpoint: `${req.protocol}://${req.get('host')}/sse`,
        messagesEndpoint: `${req.protocol}://${req.get('host')}/messages`,
        serverTime: new Date().toISOString()
    });
});

export default router; 