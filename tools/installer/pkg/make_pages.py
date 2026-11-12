#!/usr/bin/env python3
"""The installer's pages, from text/<code>.json (English: en.json).

    make_pages.py --check     reports keys missing from a language, or <b> tags that don't match English
    make_pages.py <out-dir>   writes <out-dir>/<code>.lproj/{welcome,readme,conclusion}.html. Nothing at the top
                              level: Installer prefers a top-level page over the Mac's language and would always show
                              it; without one it uses en.lproj when it has no match

Installer turns these pages into plain styled text, so they keep to headings, paragraphs and numbered lists
(style.css). The disk image's picture and names come from the same file (the d_* keys; make_installer.sh).
Another language is another text/<code>.json with the same keys.
"""
import glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
RTL = {"ar", "fa"}
PAGES = {
    "welcome": [("h1", "w_title"), ("p", "w_p1"), ("p", "w_p2"), ("h2", "w_h"), ("ol", ["w_li1", "w_li2"]), ("muted", "w_muted")],
    "readme": [("h1", "r_title"), ("p", "r_p"),
               ("h2", "r_b_h"), ("ol", ["r_b_1", "r_b_2", "r_b_3"]),
               ("h2", "r_o_h"), ("ol", ["r_o_1"]),
               ("p", "r_end")],
    "conclusion": [("h1", "c_title"), ("p", "c_p"), ("h2", "c_open_h"), ("p", "c_open"),
                   ("h2", "c_trash_h"), ("p", "c_trash"), ("muted", "c_muted")],
}


def page(blocks, t, rtl=False, lang="en"):
    css = open(os.path.join(HERE, "resources", "style.css")).read()
    if rtl:
        css += "body { direction: rtl; text-align: right; }\np.step { margin: 4px 22px 4px 0; }\n"
    out = [f'<!DOCTYPE html>\n<html{" dir=\"rtl\"" if rtl else ""}><head><meta charset="utf-8"><style>\n{css}</style></head><body>']
    for kind, key in blocks:
        if kind == "ol" and rtl:
            # Installer's text conversion puts list numbers on the left even in right-to-left text, so the numbers
            # are written in, in the language's own digits.
            digits = "٠١٢٣٤٥٦٧٨٩" if lang == "ar" else "۰۱۲۳۴۵۶۷۸۹"
            out.append("\n".join(f'<p class="step">{digits[n]}. {t[k]}</p>' for n, k in enumerate(key, 1)))
        elif kind == "ol":
            out.append("<ol>\n" + "\n".join(f"<li>{t[k]}</li>" for k in key) + "\n</ol>")
        elif kind == "muted":
            out.append(f'<p class="muted">{t[key]}</p>')
        else:
            out.append(f"<{kind}>{t[key]}</{kind}>")
    return "\n".join(out) + "\n</body></html>\n"


def main():
    en = json.load(open(os.path.join(HERE, "text", "en.json")))
    if sys.argv[1:] == ["--check"]:
        problems = 0
        paths = sorted(glob.glob(os.path.join(HERE, "text", "*.json")))
        for path in paths:
            t = json.load(open(path))
            for k in en:
                if k.startswith("d_"):
                    continue  # the disk image's picture is English only
                if k not in t:
                    problems += 1
                    print(f"{os.path.basename(path)[:-5]}: missing {k}")
                elif len(re.findall(r"</?b>", en[k])) != len(re.findall(r"</?b>", t[k])):
                    problems += 1
                    print(f"{os.path.basename(path)[:-5]}: <b> tags differ in {k}")
        print(f"{len(paths)} languages, {problems} problems")
        sys.exit(1 if problems else 0)
    out = sys.argv[1]
    for path in sorted(glob.glob(os.path.join(HERE, "text", "*.json"))):
        code = os.path.basename(path)[:-5]
        t = {**en, **json.load(open(path))}
        folder = os.path.join(out, code + ".lproj")
        os.makedirs(folder, exist_ok=True)
        for name, blocks in PAGES.items():
            open(os.path.join(folder, name + ".html"), "w").write(page(blocks, t, code in RTL, code))


if __name__ == "__main__":
    main()
