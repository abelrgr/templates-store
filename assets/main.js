document.addEventListener("alpine:init", () => {
  // ── Drag-to-scroll directive ──
  Alpine.directive("dragscroll", (el) => {
    let isDown = false;
    let startX, scrollLeft, moved = false;

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      const editable = el.closest("input, textarea, [contenteditable]");
      if (editable) return;
      isDown = true;
      moved = false;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.classList.add("cursor-grabbing");
      el.classList.remove("cursor-grab");
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.2;
      if (Math.abs(walk) > 5) moved = true;
      el.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      isDown = false;
      el.classList.remove("cursor-grabbing");
      el.classList.add("cursor-grab");
    };

    const onMouseLeave = () => {
      if (isDown) onMouseUp();
    };

    // Prevent click on child buttons if dragged
    const onClickCapture = (e) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
      }
      moved = false;
    };

    el.classList.add("cursor-grab");
    el.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("click", onClickCapture, true);

    el._dragscrollCleanup = () => {
      el.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("click", onClickCapture, true);
    };
  });

  Alpine.data("appData", () => ({
    templates: [],
    modalOpen: false,
    selectedTemplate: { stats: {} },
    quickviewOpen: false,
    selectedQuickview: {},
    errorModalOpen: false,
    errorTitle: "Error",
    errorMessage: "",
    search: "",
    category: "all",
    filterTag: "",
    currentPage: 1,
    itemsPerPage: 20,
    favorites: JSON.parse(
      localStorage.getItem("abelrgr_templates_favorites") || "[]"
    ),
    userRatings: JSON.parse(
      localStorage.getItem("abelrgr_templates_userRatings") || "{}"
    ),
    ratingCooldowns: JSON.parse(
      localStorage.getItem("abelrgr_templates_ratingCooldowns") || "{}"
    ),
    darkMode:
      localStorage.getItem("abelrgr_templates_darkMode") === "true" ||
      (!("abelrgr_templates_darkMode" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
    showBackToTop: false,
    showHeaderSearch: false,
    headerCompact: false,
    countdownDays: 30,
    countdownHours: 0,
    countdownMinutes: 0,
    countdownSeconds: 0,
    countdownTargetDate: null,
    toasts: [],
    searchHistory: JSON.parse(
      localStorage.getItem("abelrgr_templates_searchHistory") || "[]"
    ),
    showSuggestions: false,
    init() {
      if (window.backendData) {
        this.templates = window.backendData.templates;
        this.countdownTargetDate = window.backendData.countdownTargetDate;
      }

      this.$watch("darkMode", (val) =>
        localStorage.setItem("abelrgr_templates_darkMode", val)
      );
      this.$watch("favorites", (val) =>
        localStorage.setItem("abelrgr_templates_favorites", JSON.stringify(val))
      );
      this.$watch("userRatings", (val) =>
        localStorage.setItem(
          "abelrgr_templates_userRatings",
          JSON.stringify(val)
        )
      );
      this.$watch("ratingCooldowns", (val) =>
        localStorage.setItem(
          "abelrgr_templates_ratingCooldowns",
          JSON.stringify(val)
        )
      );
      this.$watch("searchHistory", (val) =>
        localStorage.setItem(
          "abelrgr_templates_searchHistory",
          JSON.stringify(val)
        )
      );
      this.$watch("search", (value) => {
        this.currentPage = 1;
        this.showSuggestions = value.trim().length > 0;
        if (value.trim().length > 0) {
          const templatesSection = document.getElementById("templates");
          if (templatesSection) {
            const yOffset = -100;
            const y =
              templatesSection.getBoundingClientRect().top +
              window.scrollY +
              yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }
        this.$nextTick(() => {
          if (typeof AOS !== "undefined") AOS.refresh();
        });
      });
      this.$watch("category", () => {
        this.currentPage = 1;
        this.$nextTick(() => {
          if (typeof AOS !== "undefined") AOS.refresh();
        });
      });
      this.$watch("filterTag", () => {
        this.currentPage = 1;
        this.$nextTick(() => {
          if (typeof AOS !== "undefined") AOS.refresh();
        });
      });
      this.$watch("currentPage", () => {
        this.$nextTick(() => {
          if (typeof AOS !== "undefined") AOS.refresh();
        });
      });

      // Back to top button + header shrink
      window.addEventListener("scroll", () => {
        this.showBackToTop = window.scrollY > 300;
        this.headerCompact = window.scrollY > 100;
      });

      // Countdown timer
      this.startCountdown();
    },

    // ── Toast System ──
    showToast(message, type = "success", duration = 3500) {
      const icons = {
        success: '<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        error: '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        info: '<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        warning: '<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
      };
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type, icons, leaving: false });
      setTimeout(() => {
        const toast = this.toasts.find((t) => t.id === id);
        if (toast) toast.leaving = true;
        setTimeout(() => {
          this.toasts = this.toasts.filter((t) => t.id !== id);
        }, 300);
      }, duration);
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    getCategories() {
      const cats = new Set(
        this.templates.map((t) => t.category).filter(Boolean)
      );
      return Array.from(cats);
    },

    getTopTags(limit = 8) {
      const tagCounts = {};
      this.templates.forEach((t) => {
        if (t.tags) {
          t.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map((entry) => entry[0]);
    },

    get filteredTemplates() {
      const query = this.search.toLowerCase().trim();
      return this.templates
        .filter((t) => {
          if (query) {
            const inTitle = t.title.toLowerCase().includes(query);
            const inDesc = t.description.toLowerCase().includes(query);
            const inTags =
              t.tags &&
              t.tags.some((tag) => tag.toLowerCase().includes(query));
            if (!inTitle && !inDesc && !inTags) return false;
          }
          if (this.category !== "all" && t.category !== this.category) return false;
          if (
            this.filterTag &&
            (!t.tags ||
              !t.tags.some(
                (tag) => tag.toLowerCase() === this.filterTag.toLowerCase()
              ))
          )
            return false;
          return true;
        })
        .sort((a, b) => {
          if (!query) return 0;
          const aTitle = a.title.toLowerCase().includes(query) ? 2 : 0;
          const bTitle = b.title.toLowerCase().includes(query) ? 2 : 0;
          const aDesc = a.description.toLowerCase().includes(query) ? 1 : 0;
          const bDesc = b.description.toLowerCase().includes(query) ? 1 : 0;
          return bTitle + bDesc - (aTitle + aDesc);
        });
    },

    // ── Search Highlight ──
    highlightText(text) {
      if (!text || !this.search.trim()) return this.escapeHtml(text);
      const query = this.search.trim();
      const escaped = this.escapeRegex(query);
      const regex = new RegExp(`(${escaped})`, "gi");
      return text.replace(
        regex,
        '<mark class="bg-yellow-200 dark:bg-yellow-700/60 text-inherit rounded px-0.5">$1</mark>'
      );
    },

    escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    },

    escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    },

    // ── Search Suggestions ──
    get searchSuggestions() {
      const query = this.search.toLowerCase().trim();
      if (!query || query.length < 2) return [];
      const results = [];
      const seen = new Set();
      for (const t of this.templates) {
        if (t.title.toLowerCase().includes(query) && !seen.has(t.title)) {
          seen.add(t.title);
          results.push({ type: "template", text: t.title, folder: t.folder });
          if (results.length >= 3) break;
        }
      }
      for (const t of this.templates) {
        if (!t.tags) continue;
        for (const tag of t.tags) {
          if (tag.toLowerCase().includes(query) && !seen.has(tag)) {
            seen.add(tag);
            results.push({ type: "tag", text: tag });
            if (results.length >= 6) break;
          }
        }
        if (results.length >= 6) break;
      }
      return results;
    },

    // ── Search Scope Label ──
    get searchScopeLabel() {
      if (this.filterTag) return { label: this.filterTag, type: "tag" };
      if (this.category !== "all") return { label: this.category, type: "category" };
      return null;
    },

    get searchResultText() {
      const count = this.filteredTemplates.length;
      if (!this.search.trim() && this.category === "all" && !this.filterTag)
        return "";
      return `${count} result${count !== 1 ? "s" : ""} found`;
    },

    get totalDownloads() {
      return this.templates.reduce((sum, t) => sum + (t.stats?.downloads || 0), 0);
    },

    get recentTemplates() {
      return [...this.templates]
        .sort((a, b) => {
          const aHasStats = a.stats && a.stats.downloads;
          const bHasStats = b.stats && b.stats.downloads;
          if (aHasStats && bHasStats) {
            return b.stats.downloads - a.stats.downloads;
          }
          return 0;
        })
        .slice(0, 3);
    },

    // ── Search History ──
    saveSearch() {
      const q = this.search.trim();
      if (!q) return;
      let history = [...this.searchHistory];
      history = history.filter((h) => h.toLowerCase() !== q.toLowerCase());
      history.unshift(q);
      if (history.length > 5) history = history.slice(0, 5);
      this.searchHistory = history;
    },

    clearSearchHistory() {
      this.searchHistory = [];
      localStorage.removeItem("abelrgr_templates_searchHistory");
    },

    selectSearchSuggestion(text, type) {
      this.showSuggestions = false;
      if (type === "tag") {
        this.setFilterTag(text);
        return;
      }
      this.search = text;
      this.saveSearch();
    },

    get relatedTemplates() {
      if (!this.selectedTemplate || !this.selectedTemplate.tags) return [];
      const currentTags = this.selectedTemplate.tags;
      return this.templates
        .filter((t) => t.folder !== this.selectedTemplate.folder)
        .map((t) => {
          const commonTags = t.tags.filter((tag) => currentTags.includes(tag));
          return { ...t, score: commonTags.length };
        })
        .filter((t) => t.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    },

    setFilterTag(tag) {
      if (this.filterTag === tag) {
        this.filterTag = "";
      } else {
        this.filterTag = tag;
        this.category = "all";
      }
      this.closeModal();
      this.closeQuickview();
      // Scroll to templates section
      document
        .getElementById("templates")
        ?.scrollIntoView({ behavior: "smooth" });
    },

    get paginatedTemplates() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredTemplates.slice(start, start + this.itemsPerPage);
    },

    get totalPages() {
      return Math.ceil(this.filteredTemplates.length / this.itemsPerPage);
    },

    get formattedTargetDate() {
      if (!this.countdownTargetDate) return "";
      const date = new Date(this.countdownTargetDate);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return new Intl.DateTimeFormat(navigator.language).format(date);
    },

    openModal(template) {
      this.selectedTemplate = template;
      this.modalOpen = true;
      this.trackView(template.folder);
    },

    closeModal() {
      this.modalOpen = false;
    },

    openQuickview(template) {
      this.selectedQuickview = template;
      this.quickviewOpen = true;
      this.trackView(template.folder);
    },

    closeQuickview() {
      this.quickviewOpen = false;
    },

    showErrorModal(message, title = "Error") {
      this.errorTitle = title;
      this.errorMessage = message;
      this.errorModalOpen = true;
    },

    closeErrorModal() {
      this.errorModalOpen = false;
    },

    async trackView(folder) {
      try {
        await fetch(`/api/view/${folder}`, { method: "POST" });
        const t = this.templates.find((t) => t.folder === folder);
        if (t) t.stats.views++;
      } catch (e) {}
    },

    async handleDownload(folder) {
      try {
        this.showToast("Starting download...", "info", 2000);

        // First, check if download is allowed by making a request
        const response = await fetch(`/download/${folder}`);

        if (response.status === 429) {
          // Rate limit exceeded
          const data = await response.json();
          this.showErrorModal(data.message, "Download Limit Exceeded");
          return false;
        } else if (!response.ok) {
          // Other error
          const data = await response.json();
          this.showErrorModal(
            data.message || "Download failed",
            "Download Error"
          );
          return false;
        }

        // Download successful - proceed with actual file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${folder}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        const t = this.templates.find((t) => t.folder === folder);
        if (t) t.stats.downloads++;

        this.showToast("Downloaded successfully!", "success");
        return true;
      } catch (e) {
        console.error("Download error:", e);
        this.showErrorModal(
          "An error occurred during download",
          "Download Error"
        );
        return false;
      }
    },

    async toggleFavorite(folder, el) {
      const index = this.favorites.indexOf(folder);
      const action = index === -1 ? "add" : "remove";

      if (action === "add") {
        this.favorites.push(folder);
      } else {
        this.favorites.splice(index, 1);
      }

      // Like pop animation
      if (el) {
        const svg = el.querySelector("svg");
        if (svg) {
          svg.classList.remove("like-pop");
          void svg.offsetWidth;
          svg.classList.add("like-pop");
        }
      }

      this.showToast(
        action === "add" ? "Added to favorites!" : "Removed from favorites",
        action === "add" ? "success" : "info"
      );

      try {
        await fetch(`/api/favorite/${folder}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `action=${action}`,
        });
        const t = this.templates.find((t) => t.folder === folder);
        if (t) t.stats.favorites += action === "add" ? 1 : -1;
      } catch (e) {}
    },

    isFavorite(folder) {
      return this.favorites.includes(folder);
    },

    async rateTemplate(folder, rating, el) {
      try {
        // Check if same rating
        const currentRating = this.userRatings[folder];
        if (currentRating === rating) {
          this.showErrorModal(
            "You already gave this rating to this template",
            "Rating Error"
          );
          return;
        }

        // Star pop animation
        if (el) {
          const svg = el.querySelector("svg");
          if (svg) {
            svg.classList.remove("star-pop");
            void svg.offsetWidth;
            svg.classList.add("star-pop");
          }
        }

        // Check cooldown
        const lastRateTime = this.ratingCooldowns[folder] || 0;
        const currentTime = Date.now();
        const timeDiff = Math.floor((currentTime - lastRateTime) / 1000);

        if (timeDiff < 60) {
          const waitSeconds = 60 - timeDiff;
          this.showErrorModal(
            `You can only re-rate a template once per minute. Wait ${waitSeconds} seconds.`,
            "Rating Limit"
          );
          return;
        }

        const response = await fetch(`/api/rate/${folder}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `rating=${rating}`,
        });

        const data = await response.json();

        if (!response.ok) {
          this.showErrorModal(
            data.message || "Failed to rate template",
            "Rating Error"
          );
          return;
        }

        // Save user rating and cooldown
        this.userRatings[folder] = rating;
        this.ratingCooldowns[folder] = currentTime;

        // Update template rating
        const t = this.templates.find((t) => t.folder === folder);
        if (t && data.rating !== undefined) {
          t.rating = data.rating;
          t.stats.rating_count = data.rating_count;
          if (
            this.selectedTemplate &&
            this.selectedTemplate.folder === folder
          ) {
            this.selectedTemplate.rating = data.rating;
            this.selectedTemplate.stats.rating_count = data.rating_count;
          }
        }

        this.showToast(`Rated ${rating} star${rating > 1 ? 's' : ''}!`, "success");
      } catch (e) {
        console.error("Rating error:", e);
        this.showErrorModal("An error occurred while rating", "Rating Error");
      }
    },

    startCountdown() {
      const updateCountdown = () => {
        const now = new Date();
        const targetDate = new Date(this.countdownTargetDate);
        const diff = targetDate - now;

        if (diff > 0) {
          this.countdownDays = Math.floor(diff / (1000 * 60 * 60 * 24));
          this.countdownHours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          this.countdownMinutes = Math.floor(
            (diff % (1000 * 60 * 60)) / (1000 * 60)
          );
          this.countdownSeconds = Math.floor((diff % (1000 * 60)) / 1000);
        } else {
          // Si ya pasó la fecha, mostrar 0
          this.countdownDays = 0;
          this.countdownHours = 0;
          this.countdownMinutes = 0;
          this.countdownSeconds = 0;
        }
      };

      // Actualizar inmediatamente
      updateCountdown();
      // Actualizar cada segundo
      setInterval(updateCountdown, 1000);
    },
  }));
});

