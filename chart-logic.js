
let plantData;

async function fetchPlantData() {
    const response = await fetch('plants.json');
    const data = await response.json();
    plantData = data;
}

function categorizeWater(text){        
    //helps to aggregate the water categories so there is less of them

    const t = String(text ?? "").toLowerCase().trim();
    if(!t) return "";
    
    if(t.includes("regular")) return "Regular";
    if(t.includes("weekly")) return "Weekly";
    if(t.includes("between")) return "Dry Between";
    if(t.includes("dry")) return "When Dry";
    if(t.includes("moist")) return "Keep Moist";
}

//old function that counted the plant names and made them into numerical data
// function countBy(arr){
//     return arr.reduce((acc, item) => {
//         acc[item] = (acc[item] || 0) + 1;
//         return acc;
//     }, {});
// }

function groupBy(plants, field) {            
    //helps turn the plant names into a numerical data that can be used as the amount in the charts
    return plants.reduce((acc, plant) => {
        const key = plant[field];
        (acc[key] = acc[key] || []).push(plant.plantName);
        return acc;
    }, {});
}

function drawCountChart(canvasID, groups, label, color = "0,0,0") { //draws charts for each category
    const labels = Object.keys(groups);
    const counts = labels.map(k => groups[k].length);

    new Chart(document.getElementById(canvasID), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: counts,
                backgroundColor: `rgba(${color}, 0.89)`,
                borderColor: `rgb(${color})`,
                borderWidth: 1.6
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            onClick: (event, elements) => {      //shows the pop-up list with plant names
                if (elements.length === 0) return;
                const category = labels[elements[0].index];
                showPopup(category, groups[category]);
            },
            onHover: (event, elements) => {
                event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
            }
        }
    });
}

const nycPicks = new Set([   //list of plants that suit NYC
    "coneflower", "echinacea",
    "black-eyed susan","sedum", "hosta"
]);

const isNycPick = name => nycPicks.has(name.toLowerCase());


function showPopup(category, names) {        //pop-up function
    const unique = [...new Set(names)].sort(); 
        openPopup(`
        <h2>${category} (${unique.length} plants)</h2>
        <p class="legend"><span class="nyc-pick">Red</span> = good fit for NYC</p>
        <ul>${unique.map(n =>
            `<li class="${isNycPick(n) ? 'nyc-pick' : ''}">${n}</li>`
        ).join("")}</ul>
    `);  

    //old function that had the pop-up function
    // document.getElementById("pop-up").innerHTML = `
    //     <h2>${category} (${unique.length} plants)</h2>
    //     <p class="legend"><span class="nyc-pick">Red</span> = Good fit for NYC</p>
    //     <ul>${unique.map(n =>
    //         `<li class="${isNycPick(n) ? 'nyc-pick' : ''}">${n}</li>`
    //     ).join("")}</ul>`;
    // document.getElementById("pop-up-overlay").style.display = "block";
    // document.getElementById("pop-up").style.display = "block";

    // const close = () => {
    //     document.getElementById("pop-up-overlay").style.display = "none";
    //     document.getElementById("pop-up").style.display = "none";
    // };
    // document.getElementById("close-popup").onclick = close;
    // document.getElementById("pop-up-overlay").onclick = close;
}


function openPopup(html) { //logic for how to open up the popup behaves
    const popup = document.getElementById("pop-up");
    const overlay = document.getElementById("pop-up-overlay");
    popup.innerHTML = html + `<button id="close-popup">Close</button>`;
    popup.style.display = "block";
    overlay.style.display = "block";

    const close = () => {
        popup.style.display = "none";
        overlay.style.display = "none";
    };
    document.getElementById("close-popup").onclick = close;
    overlay.onclick = close;
}

function showPlantPopup(plantName) {
    // shows the information for the plants and each of the catergories it fit in and does the math that gets the data to categorize in the popup
    const rows = plantData.filter(p => p.plantName.toLowerCase() === plantName.toLowerCase());
    const unique = field => [...new Set(rows.map(r => r[field]))].join(", ");

    openPopup(`
        <h2>${plantName}</h2>
        <ul>
            <li><strong>Watering:</strong> ${unique("WateringCategory")}</li>
            <li><strong>Growth rate:</strong> ${unique("Growth")}</li>
            <li><strong>Sunlight:</strong> ${unique("Sunlight")}</li>
            <li><strong>Soil:</strong> ${unique("Soil")}</li>
        </ul>
    `);
}

document.addEventListener("click", e => { //clicking on the plant names for the popup
    const link = e.target.closest(".plant-link");
    if (link) showPlantPopup(link.dataset.plant);
});

async function main(){ //wait until the data is fetched before running this code; everything goes inside this function
    await fetchPlantData();
    console.log(plantData);

    plantData = plantData.map(row => ({
        plantName: row["Plant Name"],
        Growth: row["Growth"],
        Watering: row["Watering"],
        WateringCategory: categorizeWater(row["Watering"]),
        Sunlight: row["Sunlight"],
        Soil: row["Soil"]
    })

)

    const plant_names = plantData.map(plantData => plantData.plantName);
    const growth = plantData.map(plantData => plantData.Growth);
    const water = plantData.map(plantData => plantData.Watering);
    const water_category = plantData.map(plantData => plantData.WateringCategory);
    const sunlight = plantData.map(plantData => plantData.Sunlight);
    const soil = plantData.map(plantData => plantData.Soil);
    
    //old function that catergorized the water data into smaller groups and had the plant amount
    // const categoryCounts = water_category.reduce((acc, cat) => {
    //     acc[cat] = (acc[cat] || 0) + 1;
    //     return acc;
    // }, {});

    // const plantCounts = plant_names.reduce((acc, name) => {
    //     acc[name] = (acc[name] || 0) + 1;
    //     return acc;
    // }, {});


    //draw charts
    drawCountChart("water-chart", groupBy(plantData, "WateringCategory"), "Plants by Watering Category", "123, 175, 212");
    drawCountChart("growth-chart", groupBy(plantData, "Growth"), "Plants by Growth Rate", "141, 182, 0");
    drawCountChart("sunlight-chart", groupBy(plantData, "Sunlight"), "Plants by Sunlight Requirement", "239,155,15");
    drawCountChart("soil-chart", groupBy(plantData, "Soil"), "Plants by Soil Type", "84,84,7");
    

    //old that created the total number data to put into the charts for the plants
    // const total = Object.values(categoryCounts).reduce((sum, n) => sum + n, 0);
    // console.log(total);

    // const totalPlants = Object.values(plantCounts).reduce((sum, n) => sum + n, 0);
    // console.log(totalPlants);

    console.log(plant_names);
    console.log(growth);
    console.log(water);
    console.log(sunlight);
    console.log(soil);
    console.log(water_category);

}

main()
