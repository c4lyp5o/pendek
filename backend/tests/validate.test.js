import { describe, expect, test } from "bun:test";
import {
	sanitizeUrl,
	sanitizeCode,
	isBlockedUrl,
} from "../validate.js";

describe("sanitizeUrl", () => {
	test("accepts and normalizes a valid https url", () => {
		expect(sanitizeUrl("  https://www.google.com/search?q=pendek  ")).toBe(
			"https://www.google.com/search?q=pendek"
		);
	});

	test("accepts http", () => {
		expect(sanitizeUrl("http://example.com")).toMatch(/^http:\/\//);
	});

	test("rejects javascript: scheme", () => {
		expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
	});

	test("rejects data: scheme", () => {
		expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
	});

	test("rejects scheme-less / relative", () => {
		expect(sanitizeUrl("example.com")).toBeNull();
		expect(sanitizeUrl("/path")).toBeNull();
	});

	test("rejects empty / non-string", () => {
		expect(sanitizeUrl("   ")).toBeNull();
		expect(sanitizeUrl(null)).toBeNull();
		expect(sanitizeUrl(undefined)).toBeNull();
		expect(sanitizeUrl(42)).toBeNull();
	});
});

describe("isBlockedUrl", () => {
	test("blocks known shortener abusers", () => {
		expect(isBlockedUrl("https://bit.ly/xyz")).toBe(true);
		expect(isBlockedUrl("https://www.tinyurl.com/x")).toBe(true);
	});

	test("allows normal urls", () => {
		expect(isBlockedUrl("https://example.com")).toBe(false);
	});
});

describe("sanitizeCode", () => {
	test("accepts normal alphanumeric slug", () => {
		expect(sanitizeCode("  mylink1  ")).toBe("mylink1");
	});

	test("rejects too short", () => {
		expect(sanitizeCode("abc")).toBeNull();
	});

	test("rejects too long", () => {
		expect(sanitizeCode("a".repeat(26))).toBeNull();
	});

	test("rejects non-alphanumeric", () => {
		expect(sanitizeCode("my link!")).toBeNull();
		expect(sanitizeCode("link/evil")).toBeNull();
		expect(sanitizeCode("na%C3%AFve")).toBeNull();
	});

	test("rejects reserved slugs", () => {
		expect(sanitizeCode("dashboard")).toBeNull();
		expect(sanitizeCode("login")).toBeNull();
		expect(sanitizeCode("signup")).toBeNull();
		expect(sanitizeCode("api")).toBeNull();
	});

	test("case-insensitive reserved check", () => {
		expect(sanitizeCode("Dashboard")).toBeNull();
	});
});