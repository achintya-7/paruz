# Maintainer: Achintya <achintya22052000@gmail.com>
# AUR package — built from GitHub releases (pre-compiled binary).
# See https://github.com/achintya-7/paruz

pkgname=paruz-bin
pkgver=0.2.0
pkgrel=1
pkgdesc="A TUI frontend for paru/yay package management"
arch=('x86_64')
url="https://github.com/achintya-7/paruz"
license=('MIT')
options=('!strip')
source=("$url/releases/download/v$pkgver/paruz-linux-x86_64.tar.gz")
sha256sums=('1d894a01f5fb40c846442fa738cad5bb424ddd61d14cd2fbf29fe82813d8791f')
provides=('paruz')
conflicts=('paruz')

package() {
  install -Dm755 paruz "$pkgdir/usr/bin/paruz"
}
