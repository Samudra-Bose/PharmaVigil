import "@testing-library/jest-dom";
import { api } from "@/lib/api-client";

process.env.NEXT_PUBLIC_ENABLE_MOCKS = "true";
process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8787/api/v1";

// Ensure mock mode is explicitly active in test environment
api.setMockMode(true);
