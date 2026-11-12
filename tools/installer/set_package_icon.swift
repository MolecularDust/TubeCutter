// Sets the installer package's picture in the disk image: the newer macOS package icon (assets/package-icon.png).
//   set_package_icon <file> <icon.png>
import AppKit

let args = CommandLine.arguments
guard args.count == 3, let icon = NSImage(contentsOfFile: args[2]),
      NSWorkspace.shared.setIcon(icon, forFile: args[1]) else {
    print("usage: set_package_icon <file> <icon.png>  (could not set the icon)")
    exit(1)
}
