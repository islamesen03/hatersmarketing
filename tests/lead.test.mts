import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLead, UNSURE } from "../src/lib/lead.ts";

const serviceValues = ["meta-reklam-yonetimi", "strateji-ve-marka-konumlandirma"];

const valid = {
  name: "Ayşe Yılmaz",
  company: "Örnek Marka",
  email: "AYSE@ORNEK.COM",
  phone: "",
  website: "ornekmarka.com",
  services: ["meta-reklam-yonetimi"],
  brief: "Reklam harcıyoruz ama siparişler beklediğimiz gibi gelmiyor.",
  budget: "",
  kvkk: true,
};

test("accepts a complete brief and normalises it", () => {
  const result = parseLead(valid, { serviceValues });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.data.email, "ayse@ornek.com");
  assert.equal(result.data.website, "https://ornekmarka.com");
});

test("requires name, company, email, brief, a service and the KVKK acknowledgement", () => {
  const result = parseLead({}, { serviceValues });
  assert.equal(result.ok, false);
  if (result.ok) return;
  for (const field of ["name", "company", "email", "services", "brief", "kvkk"]) {
    assert.ok(result.errors[field as keyof typeof result.errors], `${field} should be required`);
  }
  assert.equal(result.errors.phone, undefined, "phone is optional");
  assert.equal(result.errors.website, undefined, "website is optional");
});

test("rejects malformed email, phone and website", () => {
  const result = parseLead(
    { ...valid, email: "ayse@", phone: "abc", website: "not a site" },
    { serviceValues },
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.ok(result.errors.email);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.website);
});

test("accepts a Turkish mobile number in common formats", () => {
  for (const phone of ["+90 532 123 45 67", "0532 123 45 67", "(0532) 123-45-67"]) {
    assert.equal(parseLead({ ...valid, phone }, { serviceValues }).ok, true, phone);
  }
});

test("only allows known services, plus 'not sure yet'", () => {
  assert.equal(parseLead({ ...valid, services: [UNSURE] }, { serviceValues }).ok, true);
  const bad = parseLead({ ...valid, services: ["google-ads"] }, { serviceValues });
  assert.equal(bad.ok, false);
});

test("rejects unknown budget values and too-short briefs", () => {
  const result = parseLead({ ...valid, budget: "1m", brief: "kısa" }, { serviceValues });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.ok(result.errors.budget);
  assert.ok(result.errors.brief);
});

test("strips control characters but keeps line breaks in the brief", () => {
  const result = parseLead(
    { ...valid, name: "Ayşe\u0000 Yılmaz", brief: "Birinci satır yeterince uzun.\nİkinci satır\u0007." },
    { serviceValues },
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.data.name, "Ayşe Yılmaz");
  assert.equal(result.data.brief, "Birinci satır yeterince uzun.\nİkinci satır.");
});
