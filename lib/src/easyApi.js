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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyApi = void 0;
class EasyApi {
    constructor(host) {
        this.notify = (info) => {
            console.error(info);
        };
        this.host = host || "/api";
    }
    call(group, action, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.host}?group=${group}&action=${action}`;
            const response = yield fetch(url, {
                method: "POST",
                // credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }).catch((e) => {
                this.notify({
                    message: e.message,
                    title: "Network Error",
                    type: "error",
                });
                return new Response(null, { status: 500 });
            });
            if (!response.ok) {
                if (response.status === 302) {
                    window.location.href = response.headers.get("Location") || "/";
                }
                const content = yield response.text();
                const info = this.parseError(response, content);
                const title = `${info.title || "API Error"} - ${info.statusCode}`;
                if (group === "auth" && action === "check" && info.statusCode === 401) {
                    return {};
                }
                this.notify({
                    message: info.message,
                    title: title,
                    type: "error",
                });
                return {};
            }
            const responseContent = yield response.json();
            return responseContent;
        });
    }
    parseError(response, errorContent) {
        const info = {};
        info.statusCode = response.status;
        let content;
        try {
            content = JSON.parse(errorContent !== null && errorContent !== void 0 ? errorContent : "");
            info.message = content;
        }
        catch (_e) {
            content = errorContent;
        }
        info.message = content;
        return info;
    }
    onNotify(callback) {
        this.notify = callback;
    }
}
exports.EasyApi = EasyApi;
