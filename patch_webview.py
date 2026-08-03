#!/usr/bin/env python3
"""
Troca o WebView padrão do Capacitor (com.getcapacitor.BridgeWebView) pelo
nosso AppWebView customizado (biblia.harpa.offline.AppWebView), que limpa
a flag IME_FLAG_NO_PERSONALIZED_LEARNING para tentar reativar as sugestões
de palavras do teclado dentro do WebView do app.

Roda depois de "npx cap add android" (o layout já foi gerado nesse ponto).
É construído para ser seguro mesmo se não encontrar nada: nesse caso, não
faz nenhuma mudança e não falha o build — o app continua funcionando
normalmente com o WebView padrão do Capacitor.
"""
import glob
import os

OLD_CLASS = "com.getcapacitor.BridgeWebView"
NEW_CLASS = "biblia.harpa.offline.AppWebView"

layout_dir = "android/app/src/main/res/layout"
changed_any = False

if os.path.isdir(layout_dir):
    for path in glob.glob(os.path.join(layout_dir, "*.xml")):
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"Aviso: não consegui ler {path}: {e}")
            continue

        if OLD_CLASS in content:
            new_content = content.replace(OLD_CLASS, NEW_CLASS)
            try:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"WebView customizado aplicado em: {path}")
                changed_any = True
            except Exception as e:
                print(f"Aviso: não consegui escrever em {path}: {e}")
else:
    print(f"Aviso: pasta de layout não encontrada ({layout_dir}) — pulando patch do WebView.")

if not changed_any:
    print(
        "Aviso: nenhum layout com BridgeWebView foi encontrado — o WebView "
        "customizado NÃO foi aplicado. O app continua funcionando "
        "normalmente com o WebView padrão do Capacitor."
    )
