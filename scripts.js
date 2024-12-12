window.entryAmount = 0;

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".entry-list-add").addEventListener("click", newEntry);

    loadEntries()

    const entries = document.querySelectorAll(".entry");
    entries.forEach(entry => {
        entry.addEventListener("click", selectEntry);
    })

    document.querySelector(".entry-delete").addEventListener("click", deleteEntry)
    document.querySelector(".diary-tittle").addEventListener("input", changeEntryName)
    document.querySelector(".diary-text").addEventListener("input", handleInputContent)

    setupThemes()
});

let themes = [
    "theme-gruvbox",
    "theme-gruvbox-light",
    "theme-dracula",
    "theme-solarized-dark",
    "theme-solarized-light",
    "theme-nord",
    "theme-material",
    "theme-jone"
]
function setupThemes(){

    const local_theme = localStorage.getItem("theme")
    if (local_theme) {
        changeTheme(local_theme)
    }

    const selector_list = document.getElementById("themes-selector-list")
    themes.forEach(theme => {
        const _li = document.createElement("li");
        _li.innerHTML = theme;
        _li.className = "themes-selector-item"
        _li.addEventListener("click", changeThemeClick)
        selector_list.appendChild(_li);
    })
}

function changeTheme(theme) {
    const body = document.getElementById("body")
    body.className = theme
    localStorage.setItem("theme", theme)
}

function changeThemeClick(){
    const theme = this.innerHTML;
    changeTheme(theme)
}

function newEntry() {
    var entryList = document.querySelector(".entry-list")

    const entry = document.createElement("div")
    entry.className = "entry"
    entry.addEventListener("click", selectEntry)

    entry.setAttribute("data-index", entryAmount)
    entryAmount++

    const entryName = document.createElement("p")
    entryName.className = "entry-name"
    entryName.innerHTML = "New Entry"

    const entryDate = document.createElement("p")
    entryDate.className = "entry-date"
    let date = new Date().toLocaleDateString()
    entryDate.innerHTML = date

    const entryDateLast = document.createElement("p")
    entryDateLast.className = "entry-date-last"
    entryDateLast.innerHTML = "Last modified: " + date

    entry.appendChild(entryName);
    entry.appendChild(entryDate);
    entry.appendChild(entryDateLast);
    entryList.appendChild(entry);

    addEntryStorage(date);
}

function selectEntry() {
    var entries = document.querySelectorAll(".entry");
    entries.forEach(entry => {
        entry.classList.remove("entry-selected");
    });

    this.classList.add("entry-selected");

    const entryName = this.querySelector(".entry-name").innerHTML;
    const entryIndex = this.getAttribute("data-index");
    const entryContent = loadEntryContent(entryIndex);

    const diaryTittle = document.querySelector(".diary-tittle");
    diaryTittle.innerHTML = entryName;
    const diaryText = document.querySelector(".diary-text");
    diaryText.value = entryContent;
}

function deleteEntry() {
    if (confirm("Are you sure you want to delete this entry?")) {
        var selectedEntry = document.querySelector(".entry-selected");
        deleteEntryStorage(selectedEntry.getAttribute("data-index"));
        selectedEntry.remove();
        const diaryTittle = document.querySelector(".diary-tittle");
        diaryTittle.innerHTML = "";
        const diaryText = document.querySelector(".diary-text");
        diaryText.value = "";
    }
    entryAmount--;
    var entries = document.querySelectorAll(".entry");
    entries.forEach((entry, index) => {
        entry.setAttribute("data-index", index);
    });
}

function changeEntryName() {
    const selectedEntry = document.querySelector(".entry-selected");
    if (!selectedEntry) return;
    const entryName = selectedEntry.querySelector(".entry-name");
    const diaryTittle = document.querySelector(".diary-tittle");
    entryName.innerHTML = diaryTittle.innerHTML;
    const entryDate = selectedEntry.querySelector(".entry-date-last");
    var date = new Date().toLocaleDateString();
    entryDate.innerHTML = "Last modified: " + date;
    saveEntry();
}

function handleInputContent() {
    const selectedEntry = document.querySelector(".entry-selected");
    if (!selectedEntry) return;
    const entryDateLast = selectedEntry.querySelector(".entry-date-last");
    var date = new Date().toLocaleDateString();
    entryDateLast.innerHTML = "Last modified: " + date;
    saveEntry();
}

function loadEntries() {
    try {
        const entries = JSON.parse(localStorage.getItem("entries"));
        if (entries) {
            entries.forEach(entry => {
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
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

function saveEntry() {
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

function addEntryStorage(date) {
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

function loadEntryContent(index) {
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

function deleteEntryStorage(index) {
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
