const app = document.querySelector<HTMLDivElement>("#app")!;
//example starter code 11/4
const tempButton = document.createElement("button");
tempButton.innerText = "click!";
app.appendChild(tempButton);
tempButton.onclick = () => {
  alert("clicka da button");
};
//fake comment to retrigger workflow
