const fullName = document.querySelector(".txt1");
const nameSearch = document.querySelector(".name-search");

const txt = document.querySelector(".txt");
const search = document.querySelector(".search");

const board = document.querySelector(".result-p");

search.addEventListener("click", async () => {
  const res = await fetch("/get?search=" + encodeURIComponent(txt.value));
  const json = await res.json();
  board.innerText = JSON.stringify(json, null, 4);
  //   console.log(json);
});

nameSearch.addEventListener("click", async () => {
  const res = await fetch(
    "/get/isAdmin?search=" + encodeURIComponent(fullName.value)
  );
  const json = await res.json();
  console.log(json);
  board.innerText = JSON.stringify(json, null, 4);
  //   const json = await res.json();
  //   console.log(json);
  //   console.log(json);
});
