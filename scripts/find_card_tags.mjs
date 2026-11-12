import http from "node:http";

http.get("http://localhost:4321/magazine/202609_mini_select-entry-guide/", res => {
  let html = "";
  res.on("data", c => html += c);
  res.on("end", () => {
    const matches = html.match(/cms-col-cards\s+cms-col-cards--cols-\d+/g);
    console.log("Rendered card sections:", matches);
  });
});
