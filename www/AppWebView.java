package biblia.harpa.offline;

import android.content.Context;
import android.text.InputType;
import android.util.AttributeSet;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;

import com.getcapacitor.BridgeWebView;

/**
 * WebView customizado só para corrigir um comportamento conhecido do
 * WebView do Android: por padrão ele costuma marcar os campos de texto
 * com a flag IME_FLAG_NO_PERSONALIZED_LEARNING, o que faz o teclado
 * (Gboard) desligar as sugestões de palavras e a correção automática
 * nesse campo — mesmo com autocomplete/autocorrect="on" no HTML.
 *
 * Aqui a gente limpa essa flag e garante os bits de autocorreção no
 * InputConnection, sem mudar mais nada do comportamento padrão do
 * WebView do Capacitor.
 */
public class AppWebView extends BridgeWebView {

    public AppWebView(Context context) {
        super(context);
    }

    public AppWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    @Override
    public InputConnection onCreateInputConnection(EditorInfo outAttrs) {
        InputConnection ic = super.onCreateInputConnection(outAttrs);
        try {
            if (outAttrs != null) {
                outAttrs.imeOptions &= ~EditorInfo.IME_FLAG_NO_PERSONALIZED_LEARNING;
                outAttrs.inputType |= InputType.TYPE_TEXT_FLAG_AUTO_CORRECT;
            }
        } catch (Exception e) {
            // Nunca deixa isso derrubar o teclado — se algo der errado aqui,
            // simplesmente segue com o comportamento padrão do WebView.
            e.printStackTrace();
        }
        return ic;
    }
}
