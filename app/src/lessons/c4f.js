/* written for this stop, not generated: it has no recorded clip, so the player reads each line in
   the device's own voice (ui.say) and the measured-length estimate below is only its backstop. */
export default { title: "Buy more, save more?", beats: [
    { dur: 9.42, line: "Mags writes a clever sign: buy three and pay less for each. The shop is quietly hoping you only wanted one.", stage: "avatar(talk); show(cart)" },
    { dur: 10.26, line: "For each pen, the bundle really is cheaper. That part is true, and if you need all three, it is a good deal.", stage: "cols(Need three,Need one); show(tick); sort(tick, a)" },
    { dur: 11.10, line: "But if you came in for one pen, the bundle makes you pay more than you planned, for pens that will sit in a drawer.", stage: "show(cross); sort(cross, b); banner(MORE THAN YOU NEEDED)" },
    { dur: 10.26, line: "The test is simple. Would you have used every one of them anyway? If yes, the deal helps. If not, it costs you.", stage: "avatar(point)" },
    { dur: 8.16, line: "Cheaper each is not the same as cheaper for you. The second one is the number that matters.", stage: "avatar(smile)" },
] };
