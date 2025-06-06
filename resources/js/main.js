let promptUserRebelsWithin5 = true;
let promptUserBaseRevealed = true;
let repMinusTimeFive = false;

document.addEventListener("DOMContentLoaded", () => {
    // TODO Refactor this
    for (let [key, value] of Object.entries(localStorage)) {
        switch (value) {
            case "Planet":
                document.getElementById(key.toLowerCase()).checked = true;
                numSelectedSystems++;
                break;
            default:
                break;
        }
    }

    loadVariantSettings();
    updateNumberOfSelectedSystems();
    setupBuildQueue();
    setupRoundMarkers();
});

const planetnames = [
    ["Coruscant", "Base Rebelde"],
    ["Felucia", "Mon Calamari", "Saleucami"],
    ["Mygeeto", "Ord Mantell"],
    ["Kashyyyk", "Malastare", "Mandalore"],
    ["Alderaan", "Cato Neimoidia", "Corellia"],
    ["Bothawui", "Kessel", "Nal Hutta", "Toydaria"],
    ["Geonosis", "Rodia", "Ryloth"],
    ["Naboo", "Sullust", "Utapau"],
    ["Bespin", "Mustafar"],
];

function setupBuildQueue() {
    planetnames.forEach((system) => {
        system.forEach((planet) => {
            cloneNodeAndChangeId(
                "buildtemplate",
                planet,
                system.indexOf(planet)
            );
            changePlanetDisplayName(planet);
            changeRadioGroupName(planet);
        });
    });

    moveBuildButton();

    setDefaultBuildOptions("Coruscant", "radioempire");
    setDefaultBuildOptions("Base Rebelde", "radiorebel");

    hideBuildTemplate();

    loadBuildQueueSettings();
}

function setupRoundMarkers() {
    // Set Rebel Rep
    const rebelrep = document.getElementById(GetSettingValueByKey("rebelrep"));
    if (rebelrep) {
        document.getElementById("round_14").checked = false;
        rebelrep.checked = true;
    }

    // Set Round
    const savedRound = document.getElementById(GetSettingValueByKey("round"));
    if (savedRound) {
        for (
            let counter = 1;
            counter < parseInt(getRoundNumber(savedRound.id));
            counter++
        ) {
            const round = document.getElementById("round_" + counter);
            round.disabled = true;
            round.checked = false;
        }

        savedRound.disabled = true;
        savedRound.checked = true;

        updateRoundNumber(getRoundNumber(savedRound.id));
    }
}

const GetSettingsByValue = (val, includes = false) => {
    let settings = new Array();
    for (let [key, value] of Object.entries(localStorage)) {
        if (includes && value.includes(val)) {
            settings.push(key + "," + value);
        } else if (value == val) {
            settings.push(key + "," + value);
        }
    }
    return settings;
};

const GetSettingsByKey = (val, includes = false) => {
    let settings = new Array();
    for (let [key, value] of Object.entries(localStorage)) {
        if (includes && key.includes(val)) {
            settings.push(key + "," + value);
        } else if (key == val) {
            settings.push(key + "," + value);
        }
    }
    return settings;
};

const GetSettingValueByKey = (keytofind) => {
    for (let [key, value] of Object.entries(localStorage)) {
        if (key == keytofind) {
            return value;
        }
    }

    return "";
};

const SaveSetting = (key, value) => {
    localStorage.setItem(key, value);
};

const RemoveSetting = (val) => {
    for (let [key, value] of Object.entries(localStorage)) {
        if (value === val) {
            localStorage.removeItem(key);
        }
    }
};

function loadBuildQueueSettings() {
    GetSettingsByValue("buildchk").forEach((planet) => {
        let planetName = planet.split(",")[0];
        let chkName = planet.split(",")[1];
        let checks = document
            .getElementById(planetName)
            .getElementsByClassName("form-check-input");
        for (let index = 0; index < checks.length; index++) {
            if (checks[index].id === chkName) {
                checks[index].checked = true;
            }
        }
    });
}

function cloneNodeAndChangeId(nodename, planetname, rowCount) {
    let clonenode = document.getElementById(nodename).cloneNode(true);
    clonenode.id = planetname;

    if (rowCount == 0) {
        // add border to the top
        clonenode.classList.add("builditemstart");
    }

    document.getElementById("buildqueue").appendChild(clonenode);
}

function changePlanetDisplayName(planetname) {
    let elements = document
        .getElementById(planetname)
        .getElementsByClassName("col-3");
    for (let index = 0; index < elements.length; index++) {
        elements[index].firstElementChild.innerText = planetname;
    }
}

function changeRadioGroupName(planetname) {
    let elements = document
        .getElementById(planetname)
        .querySelectorAll("form-check-input, [type=radio]");
    for (let index = 0; index < elements.length; index++) {
        elements[index].name = planetname + "RadioOptions";
        if (elements[index].id === "radioneutral") {
            elements[index].checked = true;
        }
    }
}

function hideBuildTemplate() {
    document.getElementById("buildtemplate").classList.add("d-none");
}

function setDefaultBuildOptions(planetname, selection) {
    let elements = document
        .getElementById(planetname)
        .querySelectorAll("form-check-input, [type=radio]");
    for (let index = 0; index < elements.length; index++) {
        if (elements[index].id === selection) {
            elements[index].checked = true;
        }
        elements[index].disabled = true;
    }
}

function moveBuildButton() {
    // Move build button to bottom of list
    document
        .getElementById("buildqueue")
        .appendChild(document.getElementById("buildbutton"));
}

function createBuildQueue() {
    resetBuildQueueCount();

    // The 'planetnames' array is arranged by groups of regions with a number of planets
    // in each region
    for (let regionCount = 0; regionCount < planetnames.length; regionCount++) {
        let region = planetnames[regionCount];

        for (let planetCount = 0; planetCount < region.length; planetCount++) {
            let planetname = region[planetCount];
            let resources = getPlanetsBuildResources(planetname);
            let isBlockaded = false;
            let isSubjugated = false;

            let checks = document
                .getElementById(planetname)
                .getElementsByClassName("form-check-input");
            for (let index = 0; index < checks.length; index++) {
                // if Blockaded checkbox is checked don't add any of this planet's resources
                if (
                    checks[index].id == "blockade" &&
                    checks[index].checked === true
                ) {
                    localStorage.setItem(
                        [planetname, checks[index].id],
                        "buildchk"
                    );
                    isBlockaded = true;
                }

                if (
                    checks[index].id == "subjugate" &&
                    checks[index].checked === true
                ) {
                    localStorage.setItem(
                        [planetname, checks[index].id],
                        "buildchk"
                    );
                    isSubjugated = true;
                }

                if (checks[index].checked == false) {
                    continue;
                }

                updateBuildQueueCount(
                    planetname,
                    isBlockaded,
                    isSubjugated,
                    checks,
                    index,
                    resources
                );
            }
        }
    }
}

function updateBuildQueueCount(
    planetname,
    isBlockaded,
    isSubjugated,
    checks,
    index,
    resources
) {
    let controlname = getControlName(checks, index, resources, isSubjugated);

    if (controlname == "") {
        return;
    }

    SaveSetting([planetname, checks[index].id], "buildchk");

    if (isBlockaded) {
        return;
    }

    resources.forEach((resource) => {
        // e.g. "build-emp-space-tri-2"
        let resourceIcon = document.getElementById(
            controlname + resource[0] + "-" + resource[1] + "-" + resource[2]
        );
        let count = parseInt(resourceIcon.innerText);
        count++;
        if (count > 0) {
            resourceIcon.classList.remove("d-none");
            resourceIcon.innerHTML = "";

            const buildNumberDiv = document.createElement("div");
            buildNumberDiv.setAttribute(
                "class",
                "build__number build__number-" + resource[1]
            );
            buildNumberDiv.append(count);
            resourceIcon.append(buildNumberDiv);
            // resourceIcon.innerText = count; // TODO: Add inner div as wrapper for number to position number correctly
        }
    });
}

function getControlName(checks, index, resources, isSubjugated) {
    const selectedRadioButton = checks[index].id;

    if (selectedRadioButton == "radioempire") {
        return "build-emp-";
    }

    // Subjugated systems always build for the Empire
    if (isSubjugated && selectedRadioButton.includes("radio")) {
        if (resources.length === 2) {
            resources.pop();
        }
        return "build-emp-";
    }

    if (selectedRadioButton == "radiorebel") {
        return "build-rebel-";
    }

    return "";
}

function getPlanetsBuildResources(planetname, subjugated = false) {
    // Each planet can have one or two resources that it produces
    // Resources are returned in arrays
    switch (planetname) {
        case "Alderaan":
        case "Coruscant":
        case "Felucia":
        case "Malastare":
        case "Kessel":
        case "Rodia":
        case "Ryloth":
            return [["ground", "tri", 1]];
        case "Bespin":
        case "Bothawui":
        case "Saleucami":
            return [["ground", "cir", 1]];
        case "Cato Neimoidia":
            return [
                ["space", "tri", 2],
                ["ground", "cir", 2],
            ];
        case "Geonosis":
            return [
                ["space", "tri", 2],
                ["ground", "squ", 2],
            ];
        case "Kashyyyk":
            return [
                ["ground", "tri", 1],
                ["ground", "tri", 1],
            ];
        case "Mandalore":
        case "Naboo":
        case "Nal Hutta":
            return [
                ["ground", "tri", 1],
                ["space", "tri", 1],
            ];
        case "Corellia":
        case "Mon Calamari":
            return [
                ["space", "tri", 3],
                ["space", "squ", 3],
            ];
        case "Mustafar":
            return [
                ["space", "tri", 2],
                ["space", "cir", 2],
            ];
        case "Mygeeto":
            return [
                ["space", "tri", 2],
                ["ground", "squ", 2],
            ];
        case "Ord Mantell":
            return [
                ["ground", "cir", 2],
                ["space", "cir", 2],
            ];
        case "Base Rebelde":
            return [
                ["space", "tri", 1],
                ["ground", "tri", 1],
            ];
        case "Sullust":
            return [
                ["ground", "tri", 2],
                ["ground", "squ", 2],
            ];
        case "Toydaria":
            return [["space", "cir", 2]];
        case "Utapau":
            return [
                ["space", "cir", 3],
                ["space", "squ", 3],
            ];
        default:
            break;
    }
}

function resetBuildQueueCount() {
    document.querySelectorAll("[id^='build-'").forEach((element) => {
        element.innerHTML = 0;
        element.classList.add("d-none");
    });

    RemoveSetting("buildchk");
}

function resetGame() {
    localStorage.clear();

    resetRemoteSystems();
    resetBuildQueue();

    location.reload();
}

function resetRemoteSystems() {
    document.querySelectorAll("[id^='planet-']").forEach((planet) => {
        document.getElementById(planet.id).checked = false;
    });

    numSelectedSystems = 0;
    updateNumberOfSelectedSystems();
}

function resetBuildQueue() {
    let checks = document.querySelectorAll(".form-check-input");
    for (let checkcount = 0; checkcount < checks.length; checkcount++) {
        const check = checks[checkcount];
        if (check.type == "checkbox" && check.id == "chkblock") {
            check.checked = false;
        } else {
            if (
                check.name == "CoruscantRadioOptions" ||
                check.name == "Base RebeldeRadioOptions"
            ) {
                continue;
            }
            if (check.id != "radioneutral") {
                continue;
            }

            check.checked = true;
        }
    }
}


function searchCardList() {
    const searchText = document.getElementById("searchbar");
    const chkboxROTE = document.getElementById("ROTE-check");

    const collapseElementList = [].slice.call(
        document.querySelectorAll(".cardlist")
    );

    collapseElementList.forEach((row) => {
      if (chkboxROTE.title.includes("ROTE-disabled")) {
          if (row.title.toUpperCase().includes(searchText.value.toUpperCase()) && !row.classList.contains("rote")) {
              row.classList.remove("d-none");
          } else {
              row.classList.add("d-none");
          }
      } else {
          if (row.title.toUpperCase().includes(searchText.value.toUpperCase())) {
              row.classList.remove("d-none");
          } else {
              row.classList.add("d-none");
          }
      }
  });
}

//backup
/*function searchCardList() {
    const searchText = document.getElementById("searchbar");

    const collapseElementList = [].slice.call(
        document.querySelectorAll(".cardlist")
    );

    collapseElementList.forEach((row) => {
        if (row.title.toUpperCase().includes(searchText.value.toUpperCase())) {
            row.classList.remove("d-none");
        } else {
            row.classList.add("d-none");
        }
    });
}*/

function loadVariantSettings() {
    let settings = GetSettingsByKey("chk", true);
    settings.forEach((setting) => {
        let id = setting.split(",")[0];
        let value = setting.split(",")[1] == "true";
        if (value) {
            setVariants(id);
        }
        document.getElementById(id).checked = value;
    });
}

/*function chkClick(cb) {
    setVariants(cb.id);
    SaveSetting(cb.id, cb.checked);
}*/

/*function setVariants(variantName) {
    switch (variantName) {
        case "chkROTE-Units":
            showHideElement("ROTE-Setup","#");
            showHideElement("Base-Setup","#");
            showHideElement("ROTE-Setup-Table","#");

            //disable ROTE combat when ROTE elements are not selected
            if (document.getElementById("chkROTE-TacticCards").disabled) {
                document.getElementById("chkROTE-TacticCards").disabled = false;
                document.getElementById("ROTE-check").title = "ROTE-enabled";
            } else {
              document.getElementById("chkROTE-TacticCards").disabled = true;
              document.getElementById("ROTE-check").title = "ROTE-disabled";
            }

            if (document.getElementById("chkROTE-TacticCards").checked) {
              showHideElement("ROTE-Battles","#");
              showHideElement("ROTE-Battles-Table","#")
              showHideElement("Base-Battles","#")
              showHideElement("Base-Battles-Table","#");
            }
            break;
        case "chkROTE-TacticCards":
            showHideElement("ROTE-Battles","#");
            showHideElement("ROTE-Battles-Table","#")
            showHideElement("Base-Battles","#")
            showHideElement("Base-Battles-Table","#");
            break;
        case "chkvar-Movement":
            showHideElement("var-movement","#");
            showHideElement("Base-movement","#");
            break;
        case "chkvar-Deployment":
            showHideElement("var-Empiredeploy","#");
            showHideElement("Base-Empiredeploy","#");
            break;
        case "chkvar-UnPlayableMissions":
            showHideElement("var-Unplayablemissions","#");
            showHideElement("Base-Unplayablemissions","#");
            break;
        case "chkvar-ActionCardExecution":
            showHideElement("var-ActionCardExecution","#");
            showHideElement("Base-ActionCardExecution","#");
            break;
        case "chkvar-RandomPlayMissions":
            showHideElement("var-RandomPlayMissions","#");
            showHideElement("Base-RandomPlayMissions","#");
            break;
        case "ReputationTime5":
            showHideElement("HiddenBase-movement",".");
            showHideElement("RevealedBase-movement",".");
            break;
        case "BaseRevealed":
            showHideElement("HiddenBase",".");
            showHideElement("RevealedBase",".");
            break;
        default:
            break;
    }
}*/

function toggleClick(cb) {
    variantVisibility(cb.id);
    SaveSetting(cb.id, cb.checked);
}

function variantVisibility(variantName) {
    switch (variantName) {
        case "chkROTE-Units":
            if (document.getElementById("chkROTE-Units").checked) { //chkROTE-units cheked
              showVariant("Setup","ROTE-","#");
              showVariant("Setup-Table","ROTE-","#");

              //enable ROTE combats toggle
              document.getElementById("chkROTE-TacticCards").disabled = false;
              document.getElementById("ROTE-check").title = "ROTE-enabled";

              //show ROTE combats if the option was checked previously
              if (document.getElementById("chkROTE-TacticCards").checked) {
                  showVariant("Battles","ROTE-","#");
                  showVariant("Battles-Table","ROTE-","#");
              }
            } else { //chkROTE-units uncheked
                hideVariant("Setup","ROTE-","#")
                hideVariant("Setup-Table","ROTE-","#")

                //disable ROTE combats
                document.getElementById("chkROTE-TacticCards").disabled = true;
                document.getElementById("ROTE-check").title = "ROTE-disabled";

                //hide ROTE combats (not allowed without ROTE units)
                hideVariant("Battles","ROTE-","#");
                hideVariant("Battles-Table","ROTE-","#");

            }
            break;

        case "chkROTE-TacticCards":
            if (document.getElementById("chkROTE-TacticCards").checked) { //chkROTE-TacticCards cheked
              showVariant("Battles","ROTE-","#");
              showVariant("Battles-Table","ROTE-","#");
            } else { //chkROTE-TacticCards uncheked
              hideVariant("Battles","ROTE-","#");
              hideVariant("Battles-Table","ROTE-","#");
            }
            break;

        case "chkvar-Movement":
            if (document.getElementById("chkvar-Movement").checked) { //chkvar-Movement cheked
              showVariant("movement","var-","#");

            } else { //chkvar-Movement uncheked
              hideVariant("movement","var-","#");

            }
            break;

        case "chkvar-Deployment":
            if (document.getElementById("chkvar-Deployment").checked) { //chkvar-Deployment cheked
              showVariant("Empiredeploy","var-","#");

            } else { //chkvar-Deployment uncheked
              hideVariant("Empiredeploy","var-","#");

            }
            break;

        case "chkvar-UnPlayableMissions":
            if (document.getElementById("chkvar-UnPlayableMissions").checked) { //cchkvar-UnPlayableMissions cheked
              showVariant("Unplayablemissions","var-","#");

            } else { //chkvar-UnPlayableMissions uncheked
              hideVariant("Unplayablemissions","var-","#");

            }
            break;

        case "chkvar-ActionCardExecution":
            if (document.getElementById("chkvar-ActionCardExecution").checked) { //cchkvar-ActionCardExecution cheked
              showVariant("ActionCardExecution","var-","#");

            } else { //chkvar-ActionCardExecution uncheked
              hideVariant("ActionCardExecution","var-","#");

            }
            break;

        case "chkvar-RandomPlayMissions":
            if (document.getElementById("chkvar-RandomPlayMissions").checked) { //cchkvar-RandomPlayMissions cheked
              showVariant("RandomPlayMissions","var-","#");

            } else { //chkvar-RandomPlayMissions uncheked
              hideVariant("RandomPlayMissions","var-","#");

            }
            break;

        /*case "ReputationTime5":
            showHideElement("HiddenBase-movement",".");
            showHideElement("RevealedBase-movement",".");
            break;

        case "BaseRevealed":
            showHideElement("HiddenBase",".");
            showHideElement("RevealedBase",".");
            break;*/
        default:
            break;
    }
}

function showVariant (id,prefix,type) { //id: variant name, without prefix (var-, Base-, ROTE-, etc); type: # or .
    document.querySelectorAll(type + prefix + id).forEach((element) => {
        element.classList.remove("d-none");
    });
    document.querySelectorAll(type + "Base-" + id).forEach((element) => {
        element.classList.add("d-none");
    });
}

function hideVariant (id,prefix,type) { //id: variant name, without var- or base- prefix; type: # or .
    document.querySelectorAll(type + prefix + id).forEach((element) => {
        element.classList.add("d-none");
    });
    document.querySelectorAll(type + "Base-" + id).forEach((element) => {
        element.classList.remove("d-none");
    });
}

/*function showHideElement(id,type) {
    document.querySelectorAll(type + id).forEach((element) => {
        if (element.classList.contains("d-none")) {
            element.classList.remove("d-none");
        } else {
            element.classList.add("d-none");
        }
    });
}*/

document.getElementById("searchbar").addEventListener("input", (e) => {
    searchCardList();
});

let numSelectedSystems = 0;

document.querySelectorAll(".planetbtn").forEach((planetbutton) => {
    planetbutton.addEventListener("click", (event) => {
        if (planetbutton.checked == true) {
            if (numSelectedSystems < 7) {
                numSelectedSystems++;
                localStorage.setItem(planetbutton.id, "Planet");
            } else{
              planetbutton.checked = false
            }
        } else {
            numSelectedSystems--;
            localStorage.removeItem(planetbutton.id);
        }

        updateNumberOfSelectedSystems();

        if (numSelectedSystems == 7) {
            //alert("¡La base Rebelde se encuentra en " + GetRebelBaseName() + "!");
          if (promptUserBaseRevealed)  {
              //display message to user
              const messageBox = new bootstrap.Modal(
                  document.getElementById("messageBox")
              );
              document.getElementById("messageBoxTitle").innerHTML =
                  "¡Base Rebelde descubierta!";
              document.getElementById("messageBoxBody").innerHTML =
                  "¡La base Rebelde se encuentra en " + GetRebelBaseName() + "!";
              messageBox.show();

              //show Revealed Base specific rules
              showVariant("RevealedBase-movement","",".");
              showVariant("RevealedBase","",".");
              hideVariant("HiddenBase-movement","",".");

              promptUserBaseRevealed = false;
          } //end if

        } else if (numSelectedSystems < 7) {
          if (!promptUserBaseRevealed) {
              //hide Revealed Base specific rules
              hideVariant("RevealedBase-movement","",".");
              hideVariant("RevealedBase","",".");
              if (!repMinusTimeFive) {
                  showVariant("HiddenBase-movement","",".");
              }

              promptUserBaseRevealed = true;
          } //end if
        } //end elseif
    }); //end addEventListener
});

function updateNumberOfSelectedSystems() {
    document.getElementById("numselectedsystems").innerText =
        numSelectedSystems;
}

function GetRebelBaseName() {
    let rebelbase;
    document.querySelectorAll(".planetbtn").forEach((planetbutton) => {
        if (planetbutton.checked == false) {
            rebelbase = planetbutton.title;
        }
    });
    return rebelbase;
}

function changeRound() {
    const rounds = document.querySelectorAll("[id^='round']");

    rounds.forEach((round) => {
        if (round.checked && round.disabled) {
            round.checked = false;

            let currentRoundNumber = getRoundNumber(round.id);
            currentRoundNumber++;

            checkIfRebelRepLessThan5(currentRoundNumber);

            if (currentRoundNumber == "17") return;

            let newRound = document.getElementById(
                "round_" + currentRoundNumber
            );

            if (newRound.checked) {
                //alert("¡Los Rebeldes ganan la partida!");
                const messageBox = new bootstrap.Modal(
                    document.getElementById("messageBox")
                );
                document.getElementById("messageBoxTitle").innerHTML =
                    "¡Victoria Rebelde!";
                document.getElementById("messageBoxBody").innerHTML =
                    "¡Los Rebeldes ganan la partida!";
                messageBox.show();
                return;
            }

            newRound.checked = true;
            newRound.disabled = true;

            updateRoundNumber(currentRoundNumber);

            SaveSetting("round", "round_" + currentRoundNumber);

            return;
        }
    });
}

function updateRoundNumber(roundnumber) {
    document.getElementById("roundnumber").innerHTML = roundnumber;
}

function checkIfRebelRepLessThan5(currentRoundNumber) {
    if (getRebelRep() - currentRoundNumber <= 5) {
        repMinusTimeFive = true;
        if (promptUserRebelsWithin5) {
            // alert('Rebels are now within FIVE rounds of winning the game. Movement rules have changed.');
            const messageBox = new bootstrap.Modal(
                document.getElementById("messageBox")
            );
            document.getElementById("messageBoxTitle").innerHTML =
                "Cruzando la línea de meta";
            document.getElementById("messageBoxBody").innerHTML =
                "Los Rebeldes están a 5 rondas de ganar la partida. Las reglas de despliege y movimiento del Imperio han cambiado";
            messageBox.show();
            promptUserRebelsWithin5 = false;
            showVariant("TimeRep5-movement","",".");
            hideVariant("HiddenBase-movement","",".");
        }
    } else {
        repMinusTimeFive = false;
        if (!promptUserRebelsWithin5) {
          hideVariant("TimeRep5-movement","",".");
          if (numSelectedSystems<7) {
            showVariant("HiddenBase-movement","",".");
          }
        }
        promptUserRebelsWithin5 = true;
    }
}

function setRebelRep(id) {
    const rounds = document.querySelectorAll("[id^='round']");

    rounds.forEach((round) => {
        if (round.checked & !round.disabled && round.id != id)
            round.checked = false;

        // Get current round and check if newly selected round is <=5
        if (round.checked && round.disabled) {
            let currentRoundNumber = getRoundNumber(round.id);
            checkIfRebelRepLessThan5(currentRoundNumber);
        }

        if (round.disabled) return;

        SaveSetting("rebelrep", id);
    });
}

function getRebelRep() {
    const rounds = document.querySelectorAll("[id^='round']");

    let roundNumber = 0;

    for (let roundCounter = 0; roundCounter < rounds.length; roundCounter++) {
        const round = rounds[roundCounter];
        if (round.checked & (round.disabled == false)) {
            roundNumber = getRoundNumber(round.id);
            break;
        }
    }

    return roundNumber;
}

function getRoundNumber(roundID) {
    return parseInt(roundID.split("_")[1]);
}

var diceD6 = {
    sides: 6,
    roll: function () {
        var randomNumber = Math.floor(Math.random() * this.sides) + 1;
        return randomNumber;
    },
};

var diceD8 = {
    sides: 8,
    roll: function () {
        var randomNumber = Math.floor(Math.random() * this.sides) + 1;
        return randomNumber;
    },
};

//Prints dice roll to the page
/*function rollD6(number) {
    var placeholder = document.getElementById("d6");
    // placeholder.innerHTML = number;
    placeholder.src = "./resources/images/D6_" + number + ".png";
    var d6Modal = new bootstrap.Modal(document.getElementById("d6modal"));
    d6Modal.toggle();
}*/
/*function rollD8(number) {
    var placeholder = document.getElementById("d8");
    // placeholder.innerHTML = number;
    placeholder.src = "./resources/images/D8_" + number + ".png";
    var d8Modal = new bootstrap.Modal(document.getElementById("d8modal"));
    d8Modal.toggle();
}*/
function rollD6D8(numberD6,numberD8) {
    var placeholderD6 = document.getElementById("d6");
    var placeholderD8 = document.getElementById("d8");
    placeholderD6.src = "./resources/images/D6_" + numberD6 + ".png";
    placeholderD8.src = "./resources/images/D8_" + numberD8 + ".png";
    var d6Modal = new bootstrap.Modal(document.getElementById("d6modal"));
    d6Modal.toggle();
}

// Captures all D6 button on website
document.querySelectorAll(".d6button").forEach((d6Button) => {
    d6Button.onclick = function () {
        var resultD6 = diceD6.roll();
        var resultD8 = diceD8.roll();
        rollD6D8(resultD6,resultD8);
    };
});

/*document.querySelectorAll(".d6button").forEach((d6Button) => {
    d6Button.onclick = function () {
        var resultD6 = diceD6.roll();
        rollD6(resultD6);
    };
});*/

// Captures all D8 button on website
/*document.querySelectorAll(".d8button").forEach((d8Button) => {
    d8Button.onclick = function () {
        var resultD8 = diceD8.roll();
        rollD8(resultD8);
    };
});*/

/*document.querySelectorAll("#expandbtn").forEach((expandButton) => {
    expandButton.onclick = function () {
        if (expandButton.innerHTML=="expand_circle_down") {
          expandButton.innerHTML = "arrow_circle_up";
        } else {
          expandButton.innerHTML = "expand_circle_down";
        }
    };
});*/

function expandClick(item) {
    var expandBtnDiv = item.parentElement;
    if (expandBtnDiv.classList.contains("updown")) {
      expandBtnDiv.classList.remove("updown");
    } else {
      expandBtnDiv.classList.add("updown");
    }
}

/*document.querySelectorAll("#expandbtn").forEach((expandButton) => {
    expandButton.onclick = function () {
        document.querySelectorAll(".expandall").forEach((expandBtnDiv) => {
            if (expandBtnDiv.classList.contains("updown")) {
              expandBtnDiv.classList.remove("updown");
              expandBtnDiv.title  = "Expandir todo";
            } else {
              expandBtnDiv.classList.add("updown");
              expandBtnDiv.title  = "Contraer todo";
            }
        });
    };
});*/

document.querySelectorAll("#reroll").forEach((rerollbtn) => {
    rerollbtn.onclick = function () {
        document.getElementById("dicepanelclosebtn").click()
        document.getElementById("botonD8").click()
    };
});

var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});
