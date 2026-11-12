// The installer package's picture in the disk image: the same blue tile as the Privacy & Security shortcut, with a
// white box and the package's name. Make it a PNG for a preview, or set it as the icon of a file:
//   render_dmg_package_icon <file> <size> <name> --png <out.png>
//   render_dmg_package_icon <file> <size> <name>
import AppKit

let args = CommandLine.arguments
guard args.count >= 4, let size = Double(args[2]) else {
    print("usage: render_dmg_package_icon <file> <size> <name> [--png <out.png>]")
    exit(1)
}
let S = CGFloat(size)
let name = args[3]

let tile = NSImage(size: NSSize(width: S, height: S), flipped: false) { _ in
    let r = NSRect(x: 0, y: 0, width: S, height: S).insetBy(dx: S * 0.04, dy: S * 0.04)
    NSColor(srgbRed: 0x2a / 255.0, green: 0x6d / 255.0, blue: 0xf4 / 255.0, alpha: 1).setFill()
    NSBezierPath(roundedRect: r, xRadius: S * 0.19, yRadius: S * 0.19).fill()

    let config = NSImage.SymbolConfiguration(pointSize: S * 0.3, weight: .semibold)
    if let box = NSImage(systemSymbolName: "shippingbox.fill", accessibilityDescription: nil)?.withSymbolConfiguration(config) {
        let white = NSImage(size: box.size, flipped: false) { rect in
            box.draw(in: rect)
            NSColor.white.set()
            rect.fill(using: .sourceAtop)
            return true
        }
        let boxRect = NSRect(x: r.midX - box.size.width / 2, y: r.midY - box.size.height / 2 + S * 0.08,
                             width: box.size.width, height: box.size.height)
        white.draw(in: boxRect)
    }

    let para = NSMutableParagraphStyle()
    para.alignment = .center
    var points = S * 0.11
    func attributes(_ p: CGFloat) -> [NSAttributedString.Key: Any] {
        [.font: NSFont.systemFont(ofSize: p, weight: .semibold), .foregroundColor: NSColor.white, .paragraphStyle: para]
    }
    while points > S * 0.07,
          NSAttributedString(string: name, attributes: attributes(points)).size().width > r.width * 0.88 {
        points -= 0.5
    }
    NSAttributedString(string: name, attributes: attributes(points)).draw(
        with: NSRect(x: r.minX, y: r.minY + S * 0.12, width: r.width, height: S * 0.25),
        options: [.usesLineFragmentOrigin])
    return true
}

if args.count == 6, args[4] == "--png" {
    guard let tiff = tile.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
          let png = rep.representation(using: .png, properties: [:]) else { exit(1) }
    try! png.write(to: URL(fileURLWithPath: args[5]))
    exit(0)
}
guard NSWorkspace.shared.setIcon(tile, forFile: args[1]) else {
    print("could not set the icon")
    exit(1)
}
