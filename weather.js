/* =========================================================
   WASTELAND — SURVIVAL
   weather.js
   Погода / день-ночь / температура
========================================================= */

(() => {

    "use strict";

    /* =====================================================
       SETTINGS
    ===================================================== */

    const SETTINGS = {

        dayLength: 20 * 60 * 1000,

        tick: 10000,

        weatherChange: 60000,

        minTemperature: -15,

        maxTemperature: 38

    };


    /* =====================================================
       WEATHER TYPES
    ===================================================== */

    const WEATHER = {

        clear: {

            id: "clear",

            name: "Ясно",

            icon: "☀️",

            temperature: 24,

            visibility: 100,

            radiation: 1,

            thirst: 1

        },

        cloudy: {

            id: "cloudy",

            name: "Облачно",

            icon: "☁️",

            temperature: 20,

            visibility: 90,

            radiation: 0,

            thirst: 0

        },

        rain: {

            id: "rain",

            name: "Дождь",

            icon: "🌧️",

            temperature: 15,

            visibility: 70,

            radiation: -1,

            thirst: -1

        },

        fog: {

            id: "fog",

            name: "Туман",

            icon: "🌫️",

            temperature: 12,

            visibility: 45,

            radiation: 0,

            thirst: 0

        },

        storm: {

            id: "storm",

            name: "Гроза",

            icon: "⛈️",

            temperature: 10,

            visibility: 40,

            radiation: -2,

            thirst: 0

        },

        heat: {

            id: "heat",

            name: "Жара",

            icon: "🔥",

            temperature: 36,

            visibility: 95,

            radiation: 3,

            thirst: 3

        },

        cold: {

            id: "cold",

            name: "Холод",

            icon: "❄️",

            temperature: -5,

            visibility: 85,

            radiation: 0,

            thirst: 0

        }

    };


    window.WeatherDatabase =
        WEATHER;


    /* =====================================================
       STATE
    ===================================================== */

    const WeatherState = {

        current: "clear",

        startedAt: Date.now(),

        lastChange: Date.now(),

        time: 12,

        day: 1,

        isNight: false,

        temperature: 24,

        visibility: 100

    };


    window.WeatherState =
        WeatherState;


    /* =====================================================
       HELPERS
    ===================================================== */

    const player = () =>
        window.Game?.player || null;


    const toast = text => {

        if (
            typeof window.showToast ===
            "function"
        ){

            window.showToast(text);

        }

    };


    const update = () => {

        if (
            typeof window.updateUI ===
            "function"
        ){

            window.updateUI();

        }

    };


    const save = () => {

        if (
            typeof window.saveGame ===
            "function"
        ){

            window.saveGame();

        }

    };


    const clamp = (
        value,
        min,
        max
    ) =>
        Math.max(
            min,
            Math.min(
                max,
                value
            )
        );


    const random = (
        min,
        max
    ) =>
        Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;


    /* =====================================================
       TIME
    ===================================================== */

    function updateTime(){

        const elapsed =
            Date.now() -
            WeatherState.startedAt;


        /*
           20 реальных минут =
           24 игровых часа.
        */

        const cycle =
            (
                elapsed %
                SETTINGS.dayLength
            ) /
            SETTINGS.dayLength;


        WeatherState.time =
            cycle * 24;


        WeatherState.day =
            Math.floor(
                elapsed /
                SETTINGS.dayLength
            ) + 1;


        WeatherState.isNight =
            WeatherState.time < 6 ||
            WeatherState.time >= 21;


        renderTime();

    }


    /* =====================================================
       WEATHER
    ===================================================== */

    function chooseWeather(){

        const hour =
            WeatherState.time;


        const options = [];


        /*
           Ночью чаще туман/холод.
        */

        if(
            hour < 6 ||
            hour >= 21
        ){

            options.push(
                "clear",
                "fog",
                "cold",
                "cloudy"
            );

        }

        else {

            options.push(
                "clear",
                "clear",
                "cloudy",
                "rain",
                "fog",
                "heat"
            );

        }


        /*
           Иногда шторм.
        */

        if(
            Math.random() < 0.12
        ){

            options.push(
                "storm"
            );

        }


        const id =
            options[
                random(
                    0,
                    options.length - 1
                )
            ];


        setWeather(
            id
        );

    }


    function setWeather(
        id
    ){

        const weather =
            WEATHER[id];


        if(!weather)
            return false;


        if(
            WeatherState.current ===
            id
        ){

            return false;

        }


        WeatherState.current =
            id;


        WeatherState.lastChange =
            Date.now();


        WeatherState.temperature =
            weather.temperature;


        WeatherState.visibility =
            weather.visibility;


        applyEnvironment();


        toast(
            `${weather.icon} ${weather.name}`
        );


        if(window.addEvent){

            addEvent(
                "🌦️",
                "Погода изменилась",
                weather.name
            );

        }


        render();

        update();

        save();


        return true;

    }


    /* =====================================================
       ENVIRONMENT
    ===================================================== */

    function applyEnvironment(){

        const p =
            player();


        if(!p)
            return;


        const weather =
            WEATHER[
                WeatherState.current
            ];


        let temperature =
            weather.temperature;


        /*
           Ночью холоднее.
        */

        if(
            WeatherState.isNight
        ){

            temperature -= 5;

        }


        /*
           Пустыня.
        */

        const zone =
            window.MapSystem?.getZone?.();


        if(
            zone?.id === "desert"
        ){

            temperature += 8;

        }


        /*
           Лес немного холоднее.
        */

        if(
            zone?.id === "forest"
        ){

            temperature -= 3;

        }


        p.temperature =
            clamp(
                temperature,
                SETTINGS.minTemperature,
                SETTINGS.maxTemperature
            );


        /*
           Радиоактивная зона.
        */

        if(
            zone?.radiation > 0 &&
            weather.radiation > 0
        ){

            if(
                window.Survival?.addRadiation
            ){

                Survival.addRadiation(
                    weather.radiation
                );

            }

        }

    }


    /* =====================================================
       SURVIVAL EFFECTS
    ===================================================== */

    function survivalEffects(){

        const p =
            player();


        if(
            !p ||
            !p.alive
        ){

            return;

        }


        const weather =
            WEATHER[
                WeatherState.current
            ];


        /*
           Жара увеличивает жажду.
        */

        if(
            weather.thirst > 0
        ){

            p.thirst =
                clamp(
                    p.thirst -
                    weather.thirst,
                    0,
                    100
                );

        }


        /*
           Холод расходует энергию.
        */

        if(
            p.temperature <= -5
        ){

            p.energy =
                clamp(
                    p.energy - 2,
                    0,
                    p.maxEnergy || 100
                );

        }


        /*
           Сильная жара.
        */

        if(
            p.temperature >= 35
        ){

            p.energy =
                clamp(
                    p.energy - 1,
                    0,
                    p.maxEnergy || 100
                );

        }


        /*
           Ночная видимость.
        */

        if(
            WeatherState.isNight
        ){

            p.visibility =
                WeatherState.visibility *
                0.65;

        }

        else {

            p.visibility =
                WeatherState.visibility;

        }


        update();

    }


    /* =====================================================
       DAY / NIGHT UI
    ===================================================== */

    function renderTime(){

        const hours =
            Math.floor(
                WeatherState.time
            );


        const minutes =
            Math.floor(
                (
                    WeatherState.time -
                    hours
                ) * 60
            );


        const formatted =
            `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;


        document
            .querySelectorAll(
                "[data-world-time]"
            )
            .forEach(
                element => {

                    element.textContent =
                        formatted;

                }
            );


        document
            .querySelectorAll(
                "[data-world-day]"
            )
            .forEach(
                element => {

                    element.textContent =
                        `День ${WeatherState.day}`;

                }
            );


        document
            .querySelectorAll(
                "[data-day-state]"
            )
            .forEach(
                element => {

                    element.textContent =
                        WeatherState.isNight
                            ? "🌙 НОЧЬ"
                            : "☀️ ДЕНЬ";

                }
            );

    }


    /* =====================================================
       WEATHER UI
    ===================================================== */

    function render(){

        const weather =
            WEATHER[
                WeatherState.current
            ];


        if(!weather)
            return;


        document
            .querySelectorAll(
                "[data-weather]"
            )
            .forEach(
                element => {

                    element.textContent =
                        `${weather.icon} ${weather.name}`;

                }
            );


        document
            .querySelectorAll(
                "[data-temperature]"
            )
            .forEach(
                element => {

                    element.textContent =
                        `${Math.round(
                            WeatherState.temperature
                        )}°C`;

                }
            );


        document
            .querySelectorAll(
                "[data-visibility]"
            )
            .forEach(
                element => {

                    element.textContent =
                        `${WeatherState.visibility}%`;

                }
            );


        /*
           Затемняем интерфейс ночью.
        */

        document.body
            .classList.toggle(
                "night",
                WeatherState.isNight
            );


        document.body
            .classList.toggle(
                `weather-${weather.id}`,
                true
            );

    }


    /* =====================================================
       MANUAL WEATHER CONTROL
       Для тестирования
    ===================================================== */

    window.setWeather =
        id => {

            return setWeather(
                id
            );

        };


    window.makeRain =
        () =>
            setWeather(
                "rain"
            );


    window.makeStorm =
        () =>
            setWeather(
                "storm"
            );


    window.makeFog =
        () =>
            setWeather(
                "fog"
            );


    window.makeHeat =
        () =>
            setWeather(
                "heat"
            );


    window.makeCold =
        () =>
            setWeather(
                "cold"
            );


    window.makeClear =
        () =>
            setWeather(
                "clear"
            );


    /* =====================================================
       WEATHER BUTTONS
    ===================================================== */

    function setupButtons(){

        document
            .querySelectorAll(
                "[data-weather-set]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            setWeather(
                                button.dataset.weatherSet
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       LIGHTING
    ===================================================== */

    function updateLighting(){

        const root =
            document.documentElement;


        if(
            WeatherState.isNight
        ){

            root.style.setProperty(
                "--world-light",
                "0.45"
            );

        }

        else {

            root.style.setProperty(
                "--world-light",
                "1"
            );

        }


        if(
            WeatherState.current ===
            "fog"
        ){

            root.style.setProperty(
                "--world-visibility",
                "0.55"
            );

        }

        else if(
            WeatherState.current ===
            "storm"
        ){

            root.style.setProperty(
                "--world-visibility",
                "0.45"
            );

        }

        else {

            root.style.setProperty(
                "--world-visibility",
                "1"
            );

        }

    }


    /* =====================================================
       TICK
    ===================================================== */

    function tick(){

        updateTime();

        applyEnvironment();

        survivalEffects();

        updateLighting();

        render();

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init(){

        updateTime();

        applyEnvironment();

        renderTime();

        render();

        setupButtons();


        setInterval(
            tick,
            SETTINGS.tick
        );


        setInterval(
            chooseWeather,
            SETTINGS.weatherChange
        );

    }


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                init,
                500
            );

        }
    );


    if(
        document.readyState !==
        "loading"
    ){

        setTimeout(
            init,
            500
        );

    }


})();
