export const displayPopup = (errorMsg) => {
    console.log(errorMsg);
    document.getElementById("popUp").style.display = 'block';
    console.log("set display to block")
    document.getElementById("errorMsg").innerHTML = errorMsg;
    console.log("Set error message")
}