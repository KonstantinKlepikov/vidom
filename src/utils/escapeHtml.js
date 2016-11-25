const AMP_RE = /&/g,
    LT_RE = /</g,
    GT_RE = />/g;

export default function escapeHtml(str) {
    str = str + '';

    let i = str.length,
        escapes = 0; // 1 — escape '&', 2 — escape '<', 4 — escape '>'

    while(i--) {
        switch(str[i]) {
            case '&':
                escapes = escapes | 1;
                break;

            case '<':
                escapes = escapes | 2;
                break;

            case '>':
                escapes = escapes | 4;
                break;
        }
    }

    if(escapes & 1) {
        str = str.replace(AMP_RE, '&amp;');
    }

    if(escapes & 2) {
        str = str.replace(LT_RE, '&lt;');
    }

    if(escapes & 4) {
        str = str.replace(GT_RE, '&gt;');
    }

    return str;
}
