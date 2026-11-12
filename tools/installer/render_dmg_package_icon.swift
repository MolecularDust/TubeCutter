// The installer package's picture in the disk image: an open white box with a blue cube inside, the look of the newer
// macOS package icons, drawn here rather than copied from Apple's artwork. Set it as a file's icon, or make a PNG:
//   render_dmg_package_icon <file> <size> [--png <out.png>]
import AppKit

let args = CommandLine.arguments
guard args.count >= 3, let size = Double(args[2]) else {
    print("usage: render_dmg_package_icon <file> <size> [--png <out.png>]")
    exit(1)
}
let S = CGFloat(size)

func poly(_ points: [(CGFloat, CGFloat)], _ color: NSColor) {
    let path = NSBezierPath()
    path.move(to: NSPoint(x: points[0].0 * S, y: points[0].1 * S))
    for p in points.dropFirst() { path.line(to: NSPoint(x: p.0 * S, y: p.1 * S)) }
    path.close()
    color.setFill()
    path.fill()
}

let tile = NSImage(size: NSSize(width: S, height: S), flipped: false) { _ in
    // Background: a soft light square, like the other installer tiles.
    let bg = NSRect(x: 0, y: 0, width: S, height: S).insetBy(dx: S * 0.04, dy: S * 0.04)
    NSGradient(colors: [NSColor(white: 0.99, alpha: 1), NSColor(white: 0.90, alpha: 1)])?.draw(
        in: NSBezierPath(roundedRect: bg, xRadius: S * 0.2, yRadius: S * 0.2), angle: -90)

    let white = NSColor(white: 0.98, alpha: 1)
    let shade = NSColor(white: 0.82, alpha: 1)
    let edge = NSColor(white: 0.70, alpha: 1)
    // Box body (front and right faces), the back walls and the flaps.
    poly([(0.22, 0.40), (0.50, 0.26), (0.50, 0.12), (0.22, 0.26)], shade)   // left front face
    poly([(0.50, 0.26), (0.78, 0.40), (0.78, 0.26), (0.50, 0.12)], edge)    // right front face
    poly([(0.22, 0.40), (0.50, 0.54), (0.78, 0.40), (0.50, 0.26)], white)   // top of the open box (rim)
    poly([(0.22, 0.26), (0.50, 0.12), (0.78, 0.26), (0.50, 0.40)], shade)   // hidden shadow under rim
    poly([(0.22, 0.40), (0.22, 0.26), (0.10, 0.20), (0.10, 0.34)], white)   // left flap
    poly([(0.78, 0.40), (0.78, 0.26), (0.90, 0.20), (0.90, 0.34)], white)   // right flap

    // Blue cube inside the box.
    let blue = NSColor(srgbRed: 0x2a / 255.0, green: 0x6d / 255.0, blue: 0xf4 / 255.0, alpha: 1)
    let lightBlue = NSColor(srgbRed: 0x5e / 255.0, green: 0x94 / 255.0, blue: 1.0, alpha: 1)
    let darkBlue = NSColor(srgbRed: 0x1d / 255.0, green: 0x4f / 255.0, blue: 0xc4 / 255.0, alpha: 1)
    poly([(0.30, 0.55), (0.50, 0.66), (0.70, 0.55), (0.50, 0.44)], lightBlue)  // top
    poly([(0.30, 0.55), (0.50, 0.44), (0.50, 0.30), (0.30, 0.41)], blue)       // left
    poly([(0.70, 0.55), (0.50, 0.44), (0.50, 0.30), (0.70, 0.41)], darkBlue)   // right
    return true
}

if args.count == 5, args[3] == "--png" {
    guard let tiff = tile.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
          let png = rep.representation(using: .png, properties: [:]) else { exit(1) }
    try! png.write(to: URL(fileURLWithPath: args[4]))
    exit(0)
}
guard NSWorkspace.shared.setIcon(tile, forFile: args[1]) else {
    print("could not set the icon")
    exit(1)
}
