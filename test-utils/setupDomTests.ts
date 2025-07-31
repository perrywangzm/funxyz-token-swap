import "@testing-library/jest-dom";

// Patch TextEncoder/TextDecoder (for libs like crypto, JWT, etc.)
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
