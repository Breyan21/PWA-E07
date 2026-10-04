"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var strict_1 = require("node:assert/strict");
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var node_url_1 = require("node:url");
var __filename = (0, node_url_1.fileURLToPath)(import.meta.url);
var __dirname = (0, node_path_1.dirname)(__filename);
var root = (0, node_path_1.resolve)(__dirname, "..");
function runTest() {
    return __awaiter(this, void 0, void 0, function () {
        var csrPath, ssrPath, loadingPath, csrContent, ssrContent, loadingContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    csrPath = (0, node_path_1.resolve)(root, "src/app/inspecciones/page.tsx");
                    ssrPath = (0, node_path_1.resolve)(root, "src/app/inspecciones/[id]/page.tsx");
                    loadingPath = (0, node_path_1.resolve)(root, "src/components/loading-state.tsx");
                    // 1. Verificamos que existen los componentes
                    return [4 /*yield*/, (0, promises_1.access)(csrPath)];
                case 1:
                    // 1. Verificamos que existen los componentes
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.access)(ssrPath)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.access)(loadingPath)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.readFile)(csrPath, "utf8")];
                case 4:
                    csrContent = _a.sent();
                    return [4 /*yield*/, (0, promises_1.readFile)(ssrPath, "utf8")];
                case 5:
                    ssrContent = _a.sent();
                    return [4 /*yield*/, (0, promises_1.readFile)(loadingPath, "utf8")];
                case 6:
                    loadingContent = _a.sent();
                    // 2. Validar CSR
                    strict_1.default.match(csrContent, /'use client'|"use client"/, "El listado no es un componente de cliente (CSR)");
                    strict_1.default.match(csrContent, /LoadingState/, "El CSR no usa LoadingState");
                    strict_1.default.match(csrContent, /setTimeout/, "El CSR no tiene latencia simulada para el LoadingState");
                    strict_1.default.match(csrContent, /useState/, "El CSR no maneja estados locales");
                    // 3. Validar SSR
                    if (ssrContent.includes('use client') || ssrContent.includes('"use client"')) {
                        strict_1.default.fail("La página de detalle no debe ser 'use client' (debe ser SSR)");
                    }
                    strict_1.default.match(ssrContent, /notFound/, "El SSR no maneja errores 404 (notFound)");
                    strict_1.default.match(ssrContent, /generateMetadata/, "El SSR no genera metadatos para SEO");
                    // 4. Validar Accesibilidad en LoadingState
                    strict_1.default.match(loadingContent, /role=["']status["']/, "LoadingState no tiene role='status'");
                    strict_1.default.match(loadingContent, /aria-busy=["']true["']/, "LoadingState no tiene aria-busy='true'");
                    console.log("rendering.spec.ts: PASS");
                    return [2 /*return*/];
            }
        });
    });
}
runTest().catch(function (err) {
    console.error("rendering.spec.ts: FAILED");
    console.error(err);
    process.exit(1);
});
