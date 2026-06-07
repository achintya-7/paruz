# Maintainer: Achintya <achintya22052000@gmail.com>
# AUR package — built from GitHub releases (bundled JS + native libs).
# See https://github.com/achintya-7/paruz

pkgname=paruz-bin
pkgver=0.1.0
pkgrel=3
pkgdesc="A TUI frontend for paru/yay package management"
arch=('x86_64')
url="https://github.com/achintya-7/paruz"
license=('MIT')
depends=('bun')
source=("$url/releases/download/v$pkgver/paruz-linux-x86_64.tar.gz")
sha256sums=('SKIP')
provides=('paruz')
conflicts=('paruz')

package() {
  install -dm755 "$pkgdir/usr/lib/paruz"
  cp -a dist/* "$pkgdir/usr/lib/paruz/"
  install -Dm755 dist/paruz "$pkgdir/usr/lib/paruz/paruz"

  install -dm755 "$pkgdir/usr/bin"
  ln -s /usr/lib/paruz/paruz "$pkgdir/usr/bin/paruz"
}
