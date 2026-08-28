/* =========================================================
   WASTELAND — SURVIVAL
   combat.js
   Боевая система
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       HELPERS
    ===================================================== */

    const getPlayer = () =>
        window.Game?.player || null;


    const toast = message => {

        if (typeof window.showToast === "function")
            window.showToast(message);

    };


    const save = () => {

        if (typeof window.saveGame === "function")
            window.saveGame();

    };


    const update = () => {

        if (typeof window.updateUI === "function")
            window.updateUI();

        render();

    };


    const random = (min, max) =>
        Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;


    const distance = (
        a,
        b
    ) => {

        const dx =
            (a.x || 0) -
            (b.x || 0);

        const dy =
            (a.y || 0) -
            (b.y || 0);

        return Math.sqrt(
            dx * dx +
            dy * dy
        );

    };


    /* =====================================================
       WEAPONS
    ===================================================== */

    const WEAPONS = {

        fists: {

            id: "fists",

            name: "Кулаки",

            icon: "👊",

            type: "melee",

            damage: 8,

            range: 1.5,

            stamina: 4,

            critical: 0.05

        },


        stone_axe: {

            id: "stone_axe",

            name: "Каменный топор",

            icon: "🪓",

            type: "melee",

            damage: 18,

            range: 1.8,

            stamina: 6,

            critical: 0.08

        },


        stone_pickaxe: {

            id: "stone_pickaxe",

            name: "Каменная кирка",

            icon: "⛏️",

            type: "melee",

            damage: 15,

            range: 1.8,

            stamina: 6,

            critical: 0.06

        },


        knife: {

            id: "knife",

            name: "Нож",

            icon: "🔪",

            type: "melee",

            damage: 22,

            range: 1.5,

            stamina: 5,

            critical: 0.12

        },


        bow: {

            id: "bow",

            name: "Лук",

            icon: "🏹",

            type: "ranged",

            damage: 30,

            range: 12,

            stamina: 8,

            critical: 0.15

        }

    };


    window.WeaponDatabase =
        WEAPONS;


    /* =====================================================
       ENEMIES
    ===================================================== */

    const ENEMIES = {

        wolf: {

            id: "wolf",

            name: "Дикий волк",

            icon: "🐺",

            maxHp: 70,

            damage: 10,

            range: 1.5,

            speed: 1.2,

            defense: 0,

            loot: [

                {
                    item: "raw_meat",
                    amount: [2, 5]
                },

                {
                    item: "leather",
                    amount: [1, 4]
                }

            ]

        },


        boar: {

            id: "boar",

            name: "Кабан",

            icon: "🐗",

            maxHp: 100,

            damage: 15,

            range: 1.5,

            speed: 0.8,

            defense: 2,

            loot: [

                {
                    item: "raw_meat",
                    amount: [4, 8]
                },

                {
                    item: "leather",
                    amount: [2, 5]
                }

            ]

        },


        scavenger: {

            id: "scavenger",

            name: "Бандит",

            icon: "🧟",

            maxHp: 120,

            damage: 18,

            range: 8,

            speed: 0.7,

            defense: 5,

            loot: [

                {
                    item: "cloth",
                    amount: [5, 12]
                },

                {
                    item: "components",
                    amount: [2, 6]
                },

                {
                    item: "scrap",
                    amount: [10, 40]
                }

            ]

        }

    };


    window.EnemyDatabase =
        ENEMIES;


    /* =====================================================
       COMBAT STATE
    ===================================================== */

    const CombatState = {

        active: false,

        weapon: "fists",

        target: null,

        enemies: [],

        lastAttack: 0,

        cooldown: 700

    };


    window.CombatState =
        CombatState;


    /* =====================================================
       COMBAT API
    ===================================================== */

    window.Combat = {


        /* -------------------------------------------------
           SPAWN ENEMY
        ------------------------------------------------- */

        spawn(
            type = "wolf",
            x = null,
            y = null
        ){

            const p =
                getPlayer();

            const template =
                ENEMIES[type];


            if(!template){

                toast(
                    "❌ Неизвестный враг"
                );

                return null;

            }


            if(x === null)
                x =
                    (p?.position.x || 0) +
                    random(-5,5);

            if(y === null)
                y =
                    (p?.position.y || 0) +
                    random(-5,5);


            const enemy = {

                id:
                    `enemy_${Date.now()}_${random(1,9999)}`,

                type:

                    type,

                name:
                    template.name,

                icon:
                    template.icon,

                hp:
                    template.maxHp,

                maxHp:
                    template.maxHp,

                damage:
                    template.damage,

                range:
                    template.range,

                speed:
                    template.speed,

                defense:
                    template.defense,

                x:
                    x,

                y:
                    y,

                alive:
                    true,

                loot:
                    template.loot,

                spawnedAt:
                    Date.now()

            };


            CombatState.enemies.push(
                enemy
            );


            CombatState.target =
                enemy;


            CombatState.active =
                true;


            toast(
                `${enemy.icon} ${enemy.name} появился`
            );


            render();

            return enemy;

        },


        /* -------------------------------------------------
           TARGET
        ------------------------------------------------- */

        target(enemyId){

            const enemy =
                CombatState.enemies.find(
                    e =>
                        e.id === enemyId &&
                        e.alive
                );


            if(!enemy){

                toast(
                    "❌ Цель не найдена"
                );

                return false;

            }


            CombatState.target =
                enemy;


            CombatState.active =
                true;


            render();

            return true;

        },


        /* -------------------------------------------------
           EQUIP WEAPON
        ------------------------------------------------- */

        equip(weaponId){

            const weapon =
                WEAPONS[weaponId];


            if(!weapon){

                toast(
                    "❌ Оружие не найдено"
                );

                return false;

            }


            if(
                weaponId !== "fists" &&
                window.Inventory &&
                !Inventory.has(
                    weaponId
                )
            ){

                toast(
                    `❌ У тебя нет: ${weapon.name}`
                );

                return false;

            }


            CombatState.weapon =
                weaponId;


            toast(
                `${weapon.icon} ${weapon.name} экипировано`
            );


            render();

            return true;

        },


        /* -------------------------------------------------
           GET EQUIPPED
        ------------------------------------------------- */

        getWeapon(){

            return (
                WEAPONS[
                    CombatState.weapon
                ] ||
                WEAPONS.fists
            );

        },


        /* -------------------------------------------------
           ATTACK
        ------------------------------------------------- */

        attack(){

            const p =
                getPlayer();


            if(!p){

                return false;

            }


            const target =
                CombatState.target;


            if(
                !target ||
                !target.alive
            ){

                toast(
                    "🎯 Сначала выбери цель"
                );

                return false;

            }


            const weapon =
                this.getWeapon();


            /*
               Cooldown.
            */

            const now =
                Date.now();


            if(
                now -
                CombatState.lastAttack <
                CombatState.cooldown
            ){

                return false;

            }


            CombatState.lastAttack =
                now;


            /*
               Энергия.
            */

            if(
                window.Player &&
                !Player.useEnergy(
                    weapon.stamina
                )
            ){

                return false;

            }


            /*
               Расстояние.
            */

            const playerPosition = {

                x:
                    p.position?.x || 0,

                y:
                    p.position?.y || 0

            };


            const targetPosition = {

                x:
                    target.x || 0,

                y:
                    target.y || 0

            };


            const range =
                distance(
                    playerPosition,
                    targetPosition
                );


            if(
                range >
                weapon.range
            ){

                toast(
                    `📏 Слишком далеко: ${range.toFixed(1)} м`
                );

                return false;

            }


            /*
               Базовый урон.
            */

            let damage =
                weapon.damage;


            /*
               Случайное отклонение.
            */

            const variation =
                random(-3,5);


            damage +=
                variation;


            /*
               Защита врага.
            */

            damage -=
                target.defense || 0;


            /*
               Минимальный урон.
            */

            damage =
                Math.max(
                    1,
                    damage
                );


            /*
               Критический удар.
            */

            const critical =
                Math.random() <
                weapon.critical;


            if(critical){

                damage *= 2;

            }


            damage =
                Math.round(
                    damage
                );


            /*
               Наносим урон.
            */

            target.hp =
                Math.max(
                    0,
                    target.hp - damage
                );


            if(critical){

                toast(
                    `💥 КРИТИЧЕСКИЙ УДАР! -${damage}`
                );

            }

            else {

                toast(
                    `${weapon.icon} Урон: -${damage}`
                );

            }


            /*
               Слом оружия —
               тестовая механика.
            */

            if(
                weaponIdExists(
                    weapon.id
                )
            ){

                damageWeapon(
                    weapon.id
                );

            }


            /*
               Проверяем смерть.
            */

            if(
                target.hp <= 0
            ){

                killTarget(
                    target
                );

            }

            else {

                enemyAttack(
                    target
                );

            }


            update();

            save();

            return true;

        },


        /* -------------------------------------------------
           STOP
        ------------------------------------------------- */

        stop(){

            CombatState.active =
                false;

            CombatState.target =
                null;


            render();

        },


        /* -------------------------------------------------
           GET ENEMIES
        ------------------------------------------------- */

        getEnemies(){

            return [
                ...CombatState.enemies
            ];

        },


        /* -------------------------------------------------
           CLEAN DEAD
        ------------------------------------------------- */

        cleanup(){

            CombatState.enemies =
                CombatState.enemies.filter(
                    enemy =>
                        enemy.alive
                );


            if(
                CombatState.target &&
                !CombatState.target.alive
            ){

                CombatState.target =
                    null;

            }


            render();

        }

    };


    /* =====================================================
       WEAPON DURABILITY
    ===================================================== */

    function weaponIdExists(
        weaponId
    ){

        return (
            weaponId !== "fists" &&
            window.Inventory?.find &&
            Inventory.find(weaponId)
        );

    }


    function damageWeapon(
        weaponId
    ){

        const item =
            Inventory.find(
                weaponId
            );


        if(!item)
            return;


        item.durability =
            Number(
                item.durability ?? 100
            ) - 1;


        if(
            item.durability <= 0
        ){

            Inventory.remove(
                weaponId,
                1
            );


            CombatState.weapon =
                "fists";


            toast(
                "💥 Оружие сломалось"
            );

        }

    }


    /* =====================================================
       ENEMY ATTACK
    ===================================================== */

    function enemyAttack(
        enemy
    ){

        const p =
            getPlayer();


        if(!p || !enemy.alive)
            return;


        /*
           Не каждый враг атакует мгновенно.
        */

        if(
            Math.random() >
            0.65
        ){

            return;

        }


        const enemyPos = {

            x:
                enemy.x,

            y:
                enemy.y

        };


        const playerPos = {

            x:
                p.position.x,

            y:
                p.position.y

        };


        const range =
            distance(
                enemyPos,
                playerPos
            );


        if(
            range >
            enemy.range
        ){

            /*
               Враг приближается.
            */

            moveEnemy(
                enemy
            );

            return;

        }


        const damage =
            Math.max(
                1,
                enemy.damage +
                random(-3,3)
            );


        if(
            window.Player &&
            Player.damage
        ){

            Player.damage(
                damage,
                enemy.name
            );

        }

        else {

            p.hp =
                Math.max(
                    0,
                    p.hp - damage
                );

        }


        toast(
            `${enemy.icon} атакует: -${damage} HP`
        );

    }


    /* =====================================================
       ENEMY MOVEMENT
    ===================================================== */

    function moveEnemy(
        enemy
    ){

        const p =
            getPlayer();


        if(!p)
            return;


        const dx =
            p.position.x -
            enemy.x;


        const dy =
            p.position.y -
            enemy.y;


        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if(length <= 0)
            return;


        enemy.x +=
            (dx / length) *
            enemy.speed *
            0.3;


        enemy.y +=
            (dy / length) *
            enemy.speed *
            0.3;


        render();

    }


    /* =====================================================
       KILL TARGET
    ===================================================== */

    function killTarget(
        enemy
    ){

        if(!enemy)
            return;


        enemy.alive =
            false;


        const p =
            getPlayer();


        if(p){

            p.kills =
                Number(
                    p.kills || 0
                ) + 1;

        }


        /*
           Выдаём лут.
        */

        const lootText = [];


        if(
            Array.isArray(
                enemy.loot
            )
        ){

            enemy.loot.forEach(
                drop => {

                    const amount =
                        random(
                            drop.amount[0],
                            drop.amount[1]
                        );


                    if(
                        drop.item ===
                        "scrap"
                    ){

                        if(p)
                            p.scrap +=
                                amount;

                    }

                    else if(
                        drop.item ===
                        "wood"
                    ){

                        if(p)
                            p.wood +=
                                amount;

                    }

                    else if(
                        drop.item ===
                        "stone"
                    ){

                        if(p)
                            p.stone +=
                                amount;

                    }

                    else if(
                        drop.item ===
                        "metal"
                    ){

                        if(p)
                            p.metal +=
                                amount;

                    }

                    else if(
                        drop.item ===
                        "cloth"
                    ){

                        if(p)
                            p.cloth +=
                                amount;

                    }

                    else if(
                        drop.item ===
                        "leather"
                    ){

                        if(p)
                            p.leather +=
                                amount;

                    }

                    else if(
                        window.Inventory?.add
                    ){

                        Inventory.add(
                            drop.item,
                            amount
                        );

                    }


                    const data =
                        window.ItemDatabase?.[
                            drop.item
                        ];


                    lootText.push(
                        `${
                            data?.icon || "📦"
                        } ${data?.name || drop.item} ×${amount}`
                    );

                }
            );

        }


        if(p){

            p.loot =
                Number(
                    p.loot || 0
                ) + 1;

        }


        toast(
            `☠️ ${enemy.name} убит`
        );


        if(window.addEvent){

            addEvent(
                "☠️",
                "Враг уничтожен",
                `${enemy.name}. Лут: ${lootText.join(", ")}`
            );

        }


        CombatState.target =
            null;


        setTimeout(
            () => {

                Combat.cleanup();

            },
            1000
        );


        update();

        save();

    }


    /* =====================================================
       SPAWN TEST ENEMIES
    ===================================================== */

    window.spawnWolf =
        () =>
            Combat.spawn(
                "wolf"
            );


    window.spawnBoar =
        () =>
            Combat.spawn(
                "boar"
            );


    window.spawnScavenger =
        () =>
            Combat.spawn(
                "scavenger"
            );


    /* =====================================================
       COMBAT UI
    ===================================================== */

    function render(){

        const container =
            document.querySelector(
                ".combat-enemies"
            );


        if(!container)
            return;


        container.innerHTML = "";


        const enemies =
            CombatState.enemies.filter(
                enemy =>
                    enemy.alive
            );


        if(enemies.length === 0){

            container.innerHTML = `
                <div class="combat-empty">
                    На территории спокойно.
                </div>
            `;

            return;

        }


        enemies.forEach(
            enemy => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "enemy-card";


                if(
                    CombatState.target?.id ===
                    enemy.id
                ){

                    card.classList.add(
                        "target"
                    );

                }


                const hpPercent =
                    (
                        enemy.hp /
                        enemy.maxHp
                    ) * 100;


                card.innerHTML = `

                    <div class="enemy-icon">
                        ${enemy.icon}
                    </div>

                    <div class="enemy-info">

                        <b>
                            ${enemy.name}
                        </b>

                        <div class="enemy-hp">
                            <span
                                style="
                                    width:${hpPercent}%
                                "
                            ></span>
                        </div>

                        <small>
                            ${Math.round(enemy.hp)}
                            /
                            ${enemy.maxHp}
                            HP
                        </small>

                    </div>

                    <button
                        type="button"
                        data-target="${enemy.id}"
                    >
                        ${
                            CombatState.target?.id ===
                            enemy.id
                                ? "ЦЕЛЬ"
                                : "ВЫБРАТЬ"
                        }
                    </button>

                `;


                card
                    .querySelector(
                        "[data-target]"
                    )
                    ?.addEventListener(
                        "click",
                        () => {

                            Combat.target(
                                enemy.id
                            );

                        }
                    );


                container.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       ATTACK BUTTON
    ===================================================== */

    function setupButtons(){

        document
            .querySelectorAll(
                "[data-attack]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            Combat.attack();

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                "[data-weapon]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            Combat.equip(
                                button.dataset.weapon
                            );

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                "[data-spawn-enemy]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            Combat.spawn(
                                button.dataset.spawnEnemy
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       CLEANUP TIMER
    ===================================================== */

    function combatTick(){

        /*
           Иногда враг двигается к игроку.
        */

        CombatState.enemies
            .filter(
                enemy =>
                    enemy.alive
            )
            .forEach(
                enemy => {

                    const p =
                        getPlayer();

                    if(!p)
                        return;


                    const range =
                        distance(
                            {
                                x: enemy.x,
                                y: enemy.y
                            },
                            {
                                x: p.position.x,
                                y: p.position.y
                            }
                        );


                    if(
                        range >
                        enemy.range &&
                        range < 15
                    ){

                        moveEnemy(
                            enemy
                        );

                    }

                }
            );

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init(){

        render();

        setupButtons();

        setInterval(
            combatTick,
            1200
        );

    }


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                init,
                250
            );

        }
    );


    if(
        document.readyState !==
        "loading"
    ){

        setTimeout(
            init,
            250
        );

    }


})();
