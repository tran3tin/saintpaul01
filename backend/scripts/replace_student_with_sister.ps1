$targetDir = "e:\project\01-hoi-dong-osp\frontend\OSP"

# Check if directory exists
if (-not (Test-Path -Path $targetDir)) {
    Write-Error "Directory not found: $targetDir"
    exit
}

# Get all HTML, CSS, and JS files recursively
$files = Get-ChildItem -Path $targetDir -Recurse -Include *.html, *.css, *.js

foreach ($file in $files) {
    try {
        # Read file content
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content

        # Perform case-sensitive replacements
        # It is important to use -creplace for case-sensitivity
        $content = $content -creplace 'STUDENT', 'SISTER'
        $content = $content -creplace 'Student', 'Sister'
        $content = $content -creplace 'student', 'sister'

        # Only write back if changes were made
        if ($content -cne $originalContent) {
            # Use UTF8 encoding to preserve special characters
            Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
            Write-Host "Updated: $($file.FullName)"
        }
    }
    catch {
        Write-Error "Failed to process $($file.FullName): $_"
    }
}

Write-Host "Replacement complete."
