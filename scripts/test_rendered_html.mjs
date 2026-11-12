import http from "http";

http.get("http://localhost:4321/magazine/202609_mini_select-entry-guide/", (res) => {
  let html = "";
  res.on("data", chunk => html += chunk);
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Has col-cards (summary/step/fit):", html.includes("cms-col-cards"));
    console.log("Has faq simple (specs accordion):", html.includes("is-simple"));
    console.log("Has cta buttons:", html.includes("cms-cta"));
    console.log("Has notes (disclaimer):", html.includes("article-notes-block"));
    console.log("Has table widget (responsive table):", html.includes("cms-table-widget"));
  });
}).on("error", (e) => {
  console.error("HTTP error:", e.message);
});
