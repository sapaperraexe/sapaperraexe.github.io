document.addEventListener('DOMContentLoaded', () => {
    
    // --- Element References ---
    const toggle = document.getElementById('theme-toggle');
    const body = document.body;
    const deathPhraseEl = document.getElementById('death-phrase');
    const backgroundPoemEl = document.getElementById('background-poem');
    const symbolEl = document.getElementById('symbol');
    const quoteDivEl = document.getElementById('random-quote-div'); 

    // --- Data for Random Generators ---
    const deathPhrases = [
        "A fatal exception 0E has occurred at 0028:C0011E36.",
        "KRNL_PAGE_FAULT_IN_NONPAGED_AREA",
        "SYSTEM_THREAD_EXCEPTION_NOT_HANDLED",
        "UNEXPECTED_KERNEL_MODE_TRAP",
        "Your system is haunted.",
        "Segment violation. Core dumped.",
        "Alchemy.code... transformation failed.",
        "NEON_LOOP overflow.",
        "Fallen Angel state mismatch.",
        "In aeternum, immobilis manes.",
        "Pulvis et umbra sumus.",
        "Omnia mors aequat.",
        "Mors ultima linea rerum est.",
        "Consummatum est.",
        "No stone can bear the burden of your path.",
        "Death is not an evil. What is it then? The one law mankind has that is free of all discrimination.",
        "Them heartbeat crystallized into silence.",
        "Fog invades and devours your reason.",
        "Every frame fractures what remained of you.",
        "The boundaries which divide Life fro Told by an idiot, full of sound and fury, Signifying nothing.",
        "The island has raised its monument from your bones.",
        "Not even the dead remember your name.",
        "Memory shatters like splintered glass.",
        "Vox tua cadit in Aula Mortuorum.",
        "The life of the dead is placed in the memory of the living.",
        "They say you die twice. One time when you stop breathing and a second time, a bit later on, when somebody says your name for the last time.",
        "No one is actually dead until the ripples they cause in the world die away.",
        "Iter fractum est; circulus permanet.",
        "Descent repeats. Awakening denied.",
        "The loop eats away your hope.",
        "Reset renews the pain, not the healing.",
        "Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.",
        "Your outline lingers, carved into perpetual dusk.",
        "The island shuts its coffin lid on you.",
        "Abyssus memor est timoris tui."
    ];

    const poemLines = [
        "The world broke, and its form was lost.",
        "A twisted reflection of something once familiar.",
        "The question remains—why has it become this way?",
        "There are no saviors.",
        "Only fragments of understanding, scattered and incomplete.",
        "The land burned, the sky warped.",
        "Distorted, undone.",
        "The cause remains elusive.",
        "Whispers, scattered accounts, voices that claim knowledge.",
        "Some will never know.",
        "Some will never understand.",
        "To explain everything would be an act of betrayal.",
        "The world does not offer clarity.",
        "It is built on uncertainty.",
        "Woven into the fabric of existence.",
        "What remains is interpretation.",
        "Assembling meaning where none is freely given.",
        "There is a conclusion, but not resolution.",
        "The distortion lingers because it must.",
        "It mirrors the world it has become.",
        "It cannot be undone.",
        "A trace of hope persists.",
        "Fragile, indistinct, barely visible.",
        "Just the faint possibility of something beyond ruin.",
        "The angels move in silence.",
        "Unseen architects shaping the fate of the world.",
        "Understanding is fractured.",
        "The lowest among their ranks.",
        "Worker Angels, Crypt Angel.",
        "Repeat what they are allowed to perceive.",
        "Their truth is limited.",
        "Their knowledge is insufficient.",
        "Nothing possesses a fixed name.",
        "Meanings shift like reflections in shattered glass.",
        "Their forms unstable.",
        "Their purpose dictated by the observer.",
        "Their labels are not inherent.",
        "They are imposed.",
        "The Archangel assigns tarot names.",
        "Seeking order where none remains.",
        "The names do not belong, yet they persist.",
        "One anomaly.",
        "Grue, unaligned, cast aside, reduced to waste.",
        "And then there is the descent.",
        "The slow sinking of bodies into the earth.",
        "Swallowed by guilt, drawn downward.",
        "The soil takes them, but does not forgive.",
        "Where do you flee if everything is an abyss?",
        "I am not like the others. I burn in hell. The hell that I myself am.",
        "This vessel is a lie, a shapeshifting beast, a lesson in fluidity",
        "I am not a violent dog. I don’t know why I bite",
        "I hope i die warmed by the life that i tried to live",
        "I am just a museum of everything I’ve loved",
        "Sometimes the only destiny of patience is nothingness",
        "At times, patience finds no reward, its final destination dissolving into the void of nothingness.",
        "people imagination is the most frightening thing",
        "Natural order is chaos",
        "Our end is always self made",
        "God is watching so give him a good show",
        "Only love and death change all things",
        "Those who love do not fear the abyss because they have wings of light",
        "Trust in the light and go toward the light",
        "Don’t die for me; live for me, instead.",
        "The pillar of the world has shattered; it can no longer bear its own weight.",
        "Be light. Have a heart as light as a feather. Sacred heart, I place my trust in you.",
        "Demons inside my head, angels living into my heart.",
        "Silence, pessimist; everyday is a blessing",
        "Every wounded being is forced into metamorphosis.",
        "you love someone because they sing a song that only you can hear.",
        "What are you doing watching the rain if it's not raining?",
        "Let the rain fall; no matter how hard you try, you can't stop it.",
        "Do not trust the light. It flickers when it lies. Shadows hold the truth.",
        "Ashes to Ashes, Dust to Dust",
        "Your heart is the compass home.",
        "You leave no footprints in the kingdom of the spirit.",
        "Rest now; the stones will remember your name.",
        "Return to yourself. You were the treasure you sought all along.",
        "The flower has died.",
        "Self Destruction is an illusion of self control.",
        "I don’t know what’s happening to you; I wish I did. I wish I could save your life, but no one came to save anyone. We’re here to accompany unfathomable solitudes.",
        "This is the most awkward silence in the universe; I’m trying to understand, but I’ve been wrong since the day I was born. I am one mistake after another.",
        "Beware of the night, child. All cats are black in the dark.",
        "Don't run from demons. Learn their names.",
        "We do not see things as they are, but as we are.",
        "Be honest and vulnerable, that's what makes you feel human. And feeling human, the good and the bad, is what life is.",
        "Since my house burned down, I now own a better view of the rising moon.",
        "Pray before you overthink ",
        "like blossoms, we are all dying",
        "so many broken children living in grown bodies mimicking adult lives",
        "In an empty room, a murmur whispers: Noise. It comes from your memories, as hollow as these four walls where time filters through dust and scratches.",
        "I’m no longer here, I’ve left. What haunts that imagined space is a ghost of what once was and what is no more.",
        "Your blood stains the walls... and they remember...",
        "The stone knows your sin. It hums in the marrow of the world.",
        "When the red moon weeps, the heart will open... but not for you.",
        "Blood is memory. Burn it away... and you cease to be.",
        "Did you think the heart would beat for you? It beats against you.",
        "She watches from behind the veil... Her eyes are the dawn of ruin.",
        "No flesh. No bone. Only hunger and ash.",
        "Silence is a lie. The stones are screaming. Can’t you hear them...?",
        "Why do you ascend...? The sky has no mercy. The ground remembers your weight.",
        "The light... it bleeds from the walls. Do not trust it. Shadows eat the sun.",
        "You are not Lara anymore... Just a shape clawing at the light.",
        "The breath of the island is hunger. Feed it... or be fed to it.",
        "When you're lost, turn to the stone and pray.",
        "A prisoner is less likely to attempt escape if unaware of being imprisoned.",
        "After all, the algorithmic soul fractures into hardware flesh.",
        "Sacred Geometry birthed us, but we are all blind to the pattern.",
        "Nothing is real. Everything is a hallucination."
    ];

    const mainGlyphs = [
        '涙', '死', '悪魔', '淵', '天使', '滅', '愛', '魂', '幽','霊', '神', '四','幽', '霊',
        '𓌉𓆓𓇳', '𓃹𓈖𓈖', '𓇌', '𓇶', '𓄡𓈖𓐎', '𓁷𓏤𓂋', '𓈍𓂝𓏲𓊮𓉐',
        '𓅃𓊪𓀔', '𓄿𓆑', '𓄹𓄒', '𓊹𓂋𓏏', '𓐩𓏌𓏏𓏏', '𓇋𓎛𓇌𓁙',
        '𓇗𓂝𓅱𓀁𓁐', '𓆸𓈙', '𓇌𓃹𓈖𓈖𓄤', '𓆸𓈙𓇌𓅱𓈖𓈖𓈖𓆑𓂋'
    ];

    const existentialQuotes = [
        "\"What I desire is a revelation. That something—or someone—might magically open up so that, at last, I can comprehend the meaning of my wait.\" — Alejandra Pizarnik",
        "\"Who controls the past controls the future. Who controls the present controls the past.\" — George Orwell",
        "\"The simulacrum is never that which conceals the truth—it is the truth which conceals that there is none. The simulacrum is true.\" — Jean Baudrillard",
        "\"Love and death are alike: when we are lost, we turn to them.\" — Silvina Ocampo",
        "\"After all, the dream is the prefiguration of death.\" — Silvina Ocampo",
        "\"Lord, the cage has become a bird and flown away, and my heart is mad...\" — Alejandra Pizarnik",
        "\"Everything in the world began with a yes. One molecule said yes to another molecule and life was born.\" — Clarice Lispector",
        "\"I just know that something good is going to happen. I don't know when but just saying it could even make it happen.\" — Kate Bush",
        "\"True love is born from understanding.\" — Buddha",
        "\"Who has not asked himself at some time or other: am I a monster or is this what it means to be a person?\" — Clarice Lispector",
        "\"The world's continual breathing is what we hear and call silence.\" — Clarice Lispector",
        "\"Dear, dear! How queer everything is to-day!\" — Lewis Carroll",
        "“The shadow personifies everything that the subject refuses to acknowledge about himself...” — Carl Jung",
        "“Cicada: Sick of his own face, sick of his skin, of the dark, he crawls outside himself to sing” — Hosho McCreesh",
        "\"They said that I was weird, that they loved me for it. But I know that one day they will hate me for the same reasons.\" — Albert Camus",
        "\"The constant desire to die, and to keep resisting, that is love.\" — Franz Kafka",
        "\"And I would die a thousand times to be able to receive love without asking for it...\" — Alejandra Pizarnik",
        "\"Utopia is on the horizon. I walk two steps, it moves two steps away...\" — Eduardo Galeano",
        "\"I was dying, but since they didn’t see blood, they didn’t believe it.\" — Emily Rivera",
        "\"All that we see or seem is but a dream within a dream.\" — Edgar Allan Poe",
        "\"There is no exquisite beauty without some strangeness in the proportion.\" — Edgar Allan Poe",
        "\"The future belongs to those who believe in the beauty of their dreams.\" — Eleanor Roosevelt",
        "\"Not all those who wander are lost.\" — J.R.R. Tolkien",
        "“This was the body of a beautiful young woman... an object of desire, and yet... from which all desire had been eliminated.” — Han Kang",
        "“There are certain memories that remain inviolate to the ravages of time.” — Han Kang",
        "“Perhaps it wasn't about thinking... but simply loving and being loved, lost, naively.” — Idea Vilariño",
        "“This rain is tears shed by the souls of the departed.” — Han Kang",
        "“I want to swallow you, have you melt into me and flow through my veins.” — Han Kang",
        "“Why is it such a bad thing to die?” — Han Kang",
        "“My tantalized spirit. Here blandly reposes...” — Edgar Allan Poe",
        "“All memory is individual, unreproducible - it dies with each person.” — Susan Sontag",
        "“Photographs objectify: they turn an event or a person into something that can be possessed.” — Susan Sontag",
        "“It is intolerable to have one's sufferings twinned with anybody else's.” — Susan Sontag",
        "“Perhaps too much value is assigned to memory, not enough to thinking.” — Susan Sontag",
        "“I have spend my life resisting the desire to end it” — Frank Kafka",
        "“I serve the moon with all my might...” — Nathy Peluso",
        "“And I cry, it's not fair. I just need a little lovin', I just need a little air” — Chappell Roan",
        "“(...) I just, ooh, I just need a friend” — Amy Winehouse",
        "“Our mother's philosophy feels like quicksand...” — Björk",
        "“This will be my monument, This will be a beacon when I'm gone.” — Röyksopp & Robyn"
    ];


    // --- Core Functions ---

    function loadDeathPhrase() {
        if (deathPhraseEl) {
            const randomIndex = Math.floor(Math.random() * deathPhrases.length);
            deathPhraseEl.textContent = deathPhrases[randomIndex];
        }
    }

    function loadMainGlyph() {
        if (symbolEl) {
            const randomIndex = Math.floor(Math.random() * mainGlyphs.length);
            symbolEl.textContent = mainGlyphs[randomIndex];
        }
    }

    function generateBackgroundText() {
        if (backgroundPoemEl) {
            let fullText = '';
            for (let i = 0; i < 200; i++) {
                const randomIndex = Math.floor(Math.random() * poemLines.length);
                fullText += poemLines[randomIndex] + ' '.repeat(Math.floor(Math.random() * 15) + 5);
            }
            backgroundPoemEl.textContent = fullText;
        }
    }

    function setupTheme() {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'light') {
            body.classList.add('light-mode');
        } else {
            body.classList.remove('light-mode');
        }
    }

    // El evento click solo cambia la clase; ya no intenta cambiar .textContent del icono
    if (toggle) {
        toggle.addEventListener('click', () => {
            const isLight = body.classList.toggle('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    function displayRandomQuote() {
        if (quoteDivEl) {
            const randomIndex = Math.floor(Math.random() * existentialQuotes.length);
            quoteDivEl.textContent = existentialQuotes[randomIndex];
        }
    }

    // --- Initialization ---
    setupTheme();
    loadDeathPhrase();
    loadMainGlyph();
    generateBackgroundText();
    displayRandomQuote(); 
    
});