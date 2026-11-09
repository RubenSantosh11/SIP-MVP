from sip_help import core


def test_every_template_passes_the_output_filter():
    for key in core.TEMPLATES["answers"]:
        assert core.filter_hits(core._answer_text(core.render(key))) == [], key


def test_filter_blocks_names_and_pushy_words_but_not_the_disclaimer():
    assert core.filter_hits("returns vary and aren't guaranteed") == []
    assert core.filter_hits("Guaranteed returns, hurry!") == ["guaranteed", "hurry"]
    assert core.filter_hits("try Parag Parikh flexi cap") == ["flexi cap", "parag parikh"]


def test_span_check_is_verbatim_modulo_case_and_spaces():
    assert core.span_found("Pending  since monday", "my sip is pending since Monday")
    assert not core.span_found("pending since tuesday", "my sip is pending since Monday")
    assert not core.span_found("", "anything")


def test_chips_never_call_the_model_and_work_in_safe_mode():
    for chip in core.CHIPS:
        r = core.help_for(chip=chip, safe_mode=True)
        assert r["outcome"] == "answer" and r["understood"]["decided_by"] == "chip"


def test_safe_mode_free_text_goes_to_fallback():
    r = core.help_for(text="my sip failed", safe_mode=True)
    assert r["outcome"] == "fallback" and r["fallback_reason"] == "safe_mode"


def test_advice_rule_catches_clear_advice_asks():
    assert core.rule_category("can you suggest a sip that will give me good return") == "advice_request"
    assert core.rule_category("my sip is pending since monday") is None


def test_every_quick_answer_passes_the_filter_and_uses_known_categories():
    for q, by_cat in core.TEMPLATES["quick_answers"].items():
        assert q in core.QUESTIONS
        for cat in by_cat:
            assert cat in core.CATEGORIES
            assert core.filter_hits(core.quick_answer(q, cat)) == [], (q, cat)
