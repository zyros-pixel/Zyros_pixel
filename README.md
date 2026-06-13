# Zyros Pixel — AI Training Video Marketplace

A clean, dark-themed static website for selling AI training video datasets. Customers browse videos with prices and purchase via email. You manage everything from the admin panel and publish by uploading to GitHub.

---

## File Structure

```
zyros-pixel/
├── index.html       ← Public storefront
├── style.css        ← Storefront styles
├── main.js          ← Storefront logic
├── admin.html       ← Admin dashboard (password protected)
├── admin.css        ← Admin styles
├── admin.js         ← Admin logic + password
├── videos.json      ← Your video catalog (edit via admin panel)
└── README.md        ← This file
```

---

## Step 1 — Set Your Contact Email & Password

### Change the admin password
Open **admin.js** in any text editor and find line 10:
```js
const ADMIN_PASSWORD = 'ZyrosPixel2025';
```
Replace `ZyrosPixel2025` with your own secure password. Save the file.

### Set your contact email
Open **videos.json** and update the `contactEmail` field:
```json
"config": {
  "contactEmail": "your@email.com",
  ...
}
```
Or do this from the admin panel → Settings tab after deployment.

---

## Step 2 — Upload to GitHub

### Option A: GitHub Desktop (easiest)
1. Download and install [GitHub Desktop](https://desktop.github.com)
2. Click **File → New Repository**, name it `zyros-pixel`, choose a local folder
3. Copy all 8 project files into that folder
4. Click **Commit to main** → then **Publish repository**
5. Keep it **Private** (recommended for security)

### Option B: GitHub website drag & drop
1. Go to [github.com](https://github.com) → click **+** → **New repository**
2. Name it `zyros-pixel`, set to **Private**, click **Create repository**
3. Click **uploading an existing file** link
4. Drag all 8 files into the upload area → click **Commit changes**

### Option C: Terminal / Git CLI
```bash
cd /path/to/zyros-pixel
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/zyros-pixel.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Enable GitHub Pages (free hosting)

1. In your GitHub repo, click **Settings** (top tab)
2. Scroll down to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch, folder **/ (root)** → click **Save**
5. Wait 1–2 minutes, then your site is live at:
   ```
   https://YOUR_USERNAME.github.io/zyros-pixel/
   ```

---

## Step 4 — Managing Videos (Admin Workflow)

Your admin panel is at: `https://YOUR_USERNAME.github.io/zyros-pixel/admin.html`

### To add, edit, or delete a video:
1. Go to your admin page and log in
2. Click **+ Add Video** to add a new dataset, or **Edit** to change an existing one
3. Fill in the video details (title, description, price, thumbnail URL, etc.)
4. Click **Save Video**
5. When done making changes, click **⬇ Export videos.json**
6. A file named `videos.json` will download to your computer
7. **Upload this file to GitHub** to replace the old one:
   - **GitHub Desktop**: copy the new `videos.json` into your repo folder → Commit & Push
   - **GitHub website**: go to your repo → click `videos.json` → click the pencil edit icon → paste the file contents → commit. Or drag the new file to the repo and it will ask to replace.
8. Your live site updates automatically within ~1 minute

### Thumbnail images
Paste any direct image URL into the Thumbnail URL field. Good free sources:
- **Unsplash**: `https://images.unsplash.com/photo-PHOTO_ID?w=600`
- **Your own images**: upload them to your GitHub repo and use the raw URL

### Video previews
The current setup shows thumbnail images only (no video player). If you want to add a video preview, you can add a YouTube embed URL to the `videoPreviewUrl` field in videos.json.

---

## Step 5 — Custom Domain (optional)

1. Buy a domain (e.g. from Namecheap or Cloudflare)
2. In GitHub Pages settings, enter your domain under **Custom domain**
3. Add a `CNAME` file to your repo containing just your domain name:
   ```
   zyrospixel.com
   ```
4. Point your domain's DNS to GitHub Pages IPs (instructions in GitHub docs)

---

## Security Notes

| Topic | Details |
|-------|---------|
| Admin password | Stored in `admin.js` — visible to anyone who views source. Keep your repo **private**. |
| Private repo + Pages | GitHub allows Pages on private repos with a **Pro plan** ($4/mo). Alternatively, use Cloudflare Pages which supports private source repos for free. |
| Extra security | After updating `videos.json`, you can **delete** `admin.html`, `admin.css`, and `admin.js` from your GitHub repo. Use them locally next time you need to make changes. |

---

## Customisation Quick Reference

| What to change | Where |
|----------------|-------|
| Contact email | `videos.json` → `config.contactEmail` or Admin → Settings |
| Currency symbol | `videos.json` → `config.currencySymbol` |
| Admin password | `admin.js` → `ADMIN_PASSWORD` constant |
| Site colours | `style.css` → `:root` CSS variables |
| Logo / site name | `index.html` → update text in `.logo` elements |
| About text | `index.html` → How It Works section |

---

## Troubleshooting

**Videos not showing on live site**
→ Make sure `videos.json` is in the root of your repo alongside `index.html`

**Admin changes not appearing**
→ Export a fresh `videos.json` from the admin panel and upload it to GitHub

**Page shows 404**
→ GitHub Pages takes 1–2 minutes to deploy. Check Settings → Pages for the status

**Admin page accepts any password**
→ You haven't changed the default password. Edit `ADMIN_PASSWORD` in `admin.js` and re-upload

---

Built with HTML, CSS & vanilla JS — no build tools, no dependencies, no server required.
