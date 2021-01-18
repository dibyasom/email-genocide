const fullName = document.querySelector(".txt1");
const nameSearch = document.querySelector(".name-search");

const txt = document.querySelector(".txt");
const search = document.querySelector(".search");

search.addEventListener("click", async () => {
  const res = await fetch("/get?search=" + encodeURIComponent(txt.value));
  const json = await res.json();
  console.log(json);
  //   console.log(json);
});

search.addEventListener("click", async () => {
  const res = await fetch("/post?search=" + encodeURIComponent(txt.value));
  console.log(res);
  //   const json = await res.json();
  //   console.log(json);
  //   console.log(json);
});
