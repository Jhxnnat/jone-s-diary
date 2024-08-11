//global variables
window.entryAmount = 0;

document.addEventListener("DOMContentLoaded", function(){
    console.log("Document loaded");
    //add event listener to the new-entry button
    document.querySelector(".entry-list-add").addEventListener("click", newEntry);

    //load the entries from the local storage
    loadEntries()

    //add event listener to the first entry
    const entries = document.querySelectorAll(".entry");
    entries.forEach(entry => {
        entry.addEventListener("click", selectEntry);
    });

    //add event listener to the delete-entry button
    document.querySelector(".entry-delete").addEventListener("click", deleteEntry);

    //add event listener to the entry-tittle input
    document.querySelector(".diary-tittle").addEventListener("input", changeEntryName);

    //add event listener for the content input
    document.querySelector(".diary-text").addEventListener("input", handleInputContent);
});

function newEntry(){
    //first add the new entry to the entry-list
    var entryList = document.querySelector(".entry-list");
    
    const entry = document.createElement("div");
    entry.className = "entry";
    entry.addEventListener("click", selectEntry);
    //add index
    entry.setAttribute("data-index", entryAmount);
    entryAmount++;

    const entryName = document.createElement("p");
    entryName.className = "entry-name";
    entryName.innerHTML = "New Entry";
    
    const entryDate = document.createElement("p");
    entryDate.className = "entry-date";
    entryDate.innerHTML = new Date().toLocaleDateString();

    const entryDateLast = document.createElement("p");
    entryDateLast.className = "entry-date-last";
    entryDateLast.innerHTML = "Last modified: " + new Date().toLocaleDateString();

    entry.appendChild(entryName);
    entry.appendChild(entryDate);
    entry.appendChild(entryDateLast);
    entryList.appendChild(entry);

    addEntryStorage(entryDate.innerHTML);
}

function selectEntry(){
    //first remove the selected class from all entries
    var entries = document.querySelectorAll(".entry");
    entries.forEach(entry => {
        entry.classList.remove("entry-selected");
    });

    //add the selected class to the clicked entry
    this.classList.add("entry-selected");

    //change the tittle and it's content
    const entryName = this.querySelector(".entry-name").innerHTML;
    //load the content from the local storage
    const entryIndex = this.getAttribute("data-index");
    const entryContent = loadEntryContent(entryIndex);

    const diaryTittle = document.querySelector(".diary-tittle");
    diaryTittle.innerHTML = entryName;
    const diaryText = document.querySelector(".diary-text");
    diaryText.value = entryContent;
}

function deleteEntry(){
    //remove the selected entry from the entry-list
    if (confirm("Are you sure you want to delete this entry?")) {
        var selectedEntry = document.querySelector(".entry-selected");
        //remove the selected entry from the local storage
        deleteEntryStorage(selectedEntry.getAttribute("data-index"));
        //remove the selected entry from the entry-list
        selectedEntry.remove();
        //clean the diary-tittle and diary-text
        const diaryTittle = document.querySelector(".diary-tittle");
        diaryTittle.innerHTML = "";
        const diaryText = document.querySelector(".diary-text");
        diaryText.value = "";
    }
    entryAmount--;
    //reasign index
    var entries = document.querySelectorAll(".entry");
    entries.forEach((entry, index) => {
        entry.setAttribute("data-index", index);
    });
}

function changeEntryName(){
    //change the name of the selected entry
    const selectedEntry = document.querySelector(".entry-selected");
    const entryName = selectedEntry.querySelector(".entry-name");
    const diaryTittle = document.querySelector(".diary-tittle");
    entryName.innerHTML = diaryTittle.innerHTML;
    //set the date of the selected entry
    const entryDate = selectedEntry.querySelector(".entry-date-last");
    var date = new Date().toLocaleDateString();
    entryDate.innerHTML = "Last modified: " + date;
    saveEntry();
}

function handleInputContent(){
    //save the content of the diary-text to the selected entry
    const selectedEntry = document.querySelector(".entry-selected");
    const entryDateLast = selectedEntry.querySelector(".entry-date-last");
    var date = new Date().toLocaleDateString();
    entryDateLast.innerHTML = "Last modified: " + date;
    saveEntry();
}

/*Local Storage API

how is going to be used in the project?
[
    {"name":"name","date":"0","datelast":"0","content":"my content"},
    {"name":"name","date":"0","datelast":"0","content":"my content"},
    {"name":"name","date":"0","datelast":"0","content":"my content"}
]*/

function loadEntries(){
    //load the entries from the local storage
    try {
        const entries = JSON.parse(localStorage.getItem("entries"));
        if (entries) {
            entries.forEach(entry => {
                //create the entry
                var entryList = document.querySelector(".entry-list");
                const newEntry = document.createElement("div");
                newEntry.className = "entry";
                newEntry.addEventListener("click", selectEntry);
                
                newEntry.setAttribute("data-index", entryAmount);

                const entryName = document.createElement("p");
                entryName.className = "entry-name";
                entryName.innerHTML = entry.name;
                
                const entryDate = document.createElement("p");
                entryDate.className = "entry-date";
                entryDate.innerHTML = entry.date;

                const entryDateLast = document.createElement("p");
                entryDateLast.className = "entry-date-last";
                entryDateLast.innerHTML = entry.datelast;

                newEntry.appendChild(entryName);
                newEntry.appendChild(entryDate);
                newEntry.appendChild(entryDateLast);
                entryList.appendChild(newEntry);
                entryAmount++;
            });
        } else {
            console.log("No entries found");
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

function saveEntry(){
    //save the selected entry to the local storage
    const selectedEntry = document.querySelector(".entry-selected");
    const entryIndex = selectedEntry.getAttribute("data-index");
    const entryName = selectedEntry.querySelector(".entry-name").innerHTML;
    const entryDate = selectedEntry.querySelector(".entry-date").innerHTML;
    const entryDateLast = selectedEntry.querySelector(".entry-date-last").innerHTML;
    const entryContent = document.querySelector(".diary-text").value;

    const entry = {
        "index": entryIndex,
        "name": entryName,
        "date": entryDate,
        "datelast": entryDateLast,
        "content": entryContent
    }

    try {
        var entries = JSON.parse(localStorage.getItem("entries"));
        if (entries) {
            entries[entryIndex] = entry;
            localStorage.setItem("entries", JSON.stringify(entries));
        } else {
            localStorage.setItem("entries", JSON.stringify([entry]));
        }
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

function addEntryStorage(date){
    //add the selected entry to the local storage
    const entry = {
        "name": "empty",
        "date": date,
        "datelast": "no modification",
        "content": ""
    }

    try {
        const entries = JSON.parse(localStorage.getItem("entries"));
        if (entries) {
            entries.push(entry);
            localStorage.setItem("entries", JSON.stringify(entries));
        } else {
            localStorage.setItem("entries", JSON.stringify([entry]));
        }
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

function loadEntryContent(index){
    //load the content of a specific index
    try {
        const entries = JSON.parse(localStorage.getItem("entries"));
        if (entries) {
            return entries[index]["content"];
        } else {
            console.log("No entries found");
            return "no content";
        }
    } catch (error) {
        console.log(error);
    }
}

//TODO: add the delete buttom logic to work with local storage
function deleteEntryStorage(index){
    //delete the selected entry from the local storage
    try {
        const entries = JSON.parse(localStorage.getItem("entries"));
        if (entries) {
            entries.splice(index, 1);
            localStorage.setItem("entries", JSON.stringify(entries));
        } else {
            console.log("No entries found");
        }
    } catch (error) {
        console.log(error);
    }
}


//TODO: add a search bar to search for entries
//TODO: add a save copy button to save the entry to a .doc file
//TODO: make the front end look better

