"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalProxyPort = exports.getLocalIp = exports.test = void 0;
const localServer_1 = __importDefault(require("./localServer"));
const matcher_1 = require("./matcher");
const config_1 = __importDefault(require("./config"));
const dataset_1 = __importDefault(require("./utils/dataset"));
const ip_1 = require("./utils/ip");
__exportStar(require("./system"), exports);
const test = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const { configPath } = dataset_1.default;
    const { config = {} } = yield localServer_1.default.loadUserConfig(configPath || '', config_1.default);
    const matchResult = (0, matcher_1.matcher)(config.rules, url);
    return matchResult;
});
exports.test = test;
const getLocalIp = () => __awaiter(void 0, void 0, void 0, function* () {
    return (0, ip_1.getLocalIpAddress)();
});
exports.getLocalIp = getLocalIp;
const getLocalProxyPort = () => __awaiter(void 0, void 0, void 0, function* () {
    const { config } = dataset_1.default;
    return config === null || config === void 0 ? void 0 : config.port;
});
exports.getLocalProxyPort = getLocalProxyPort;
