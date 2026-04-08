const initCalculator = () => {
  var _a;
  const roofStyleSelect = document.getElementById("roof-style");
  const tileTypeSelect = document.getElementById("tile-type");
  const calculatorSection = (roofStyleSelect == null ? void 0 : roofStyleSelect.closest("section")) || document.querySelector("section.bg-background-secondary");
  if (!calculatorSection) return;
  const areasContainer = calculatorSection.querySelector(".space-y-4.col-span-1.lg\\:col-span-3");
  if (!areasContainer) return;
  const allInitialBlocks = Array.from(areasContainer.children).filter(
    (el) => {
      var _a2;
      return el.classList.contains("flex") && ((_a2 = el.querySelector("span")) == null ? void 0 : _a2.textContent.includes("DIỆN TÍCH"));
    }
  );
  const masterTemplate = (_a = allInitialBlocks.find((b) => {
    const removeBtn = b.querySelector("button.underline");
    return removeBtn && removeBtn.textContent.includes("Loại bỏ");
  }) || allInitialBlocks[allInitialBlocks.length - 1]) == null ? void 0 : _a.cloneNode(true);
  const buttons = areasContainer.querySelectorAll("button");
  const addAreaBtn = Array.from(buttons).find((btn) => btn.textContent.includes("+ Thêm diện tích"));
  const calculateBtn = Array.from(buttons).find((btn) => btn.textContent.includes("TÍNH TOÁN KHỐI LƯỢNG"));
  const resultRows = calculatorSection.querySelectorAll(".pt-8 .space-y-4 > .grid.grid-cols-12");
  const resultTilesAm = resultRows[0];
  const resultTilesDuong = resultRows[1];
  const resultDiem = resultRows[2];
  const extraLossCheckbox = calculatorSection.querySelector("#extra-loss");
  const lossRadios = calculatorSection.querySelectorAll('input[name="loss-rate"]');
  const vnFormatter = new Intl.NumberFormat("vi-VN");
  const format = (num) => vnFormatter.format(num);
  const getAreaBlocks = () => {
    const blocks = Array.from(areasContainer.children).filter(
      (el) => {
        var _a2;
        return el.classList.contains("flex") && ((_a2 = el.querySelector("span")) == null ? void 0 : _a2.textContent.includes("DIỆN TÍCH"));
      }
    );
    return blocks;
  };
  const getAreaTitle = (block) => Array.from(block.querySelectorAll("span")).find((span) => /DIỆN\s*TÍCH/i.test(span.textContent || ""));
  const updateCoeffLabels = () => {
    if (!tileTypeSelect) return;
    const selectedTile = tileTypeSelect.options[tileTypeSelect.selectedIndex];
    if (!selectedTile || selectedTile.value === "") {
      if (resultTilesAm) resultTilesAm.querySelectorAll("span")[2].textContent = `-- viên/m²`;
      if (resultTilesDuong) resultTilesDuong.querySelectorAll("span")[2].textContent = `-- viên/m²`;
      if (resultDiem) resultDiem.querySelectorAll("span")[2].textContent = `-- cặp/md`;
      return;
    }
    const amCoeff = parseFloat(selectedTile.dataset.am) || 40;
    const duongCoeff = parseFloat(selectedTile.dataset.duong) || 27;
    const diemCoeff = parseFloat(selectedTile.dataset.diem) || 5;
    if (resultTilesAm) {
      const coeffSpan = resultTilesAm.querySelectorAll("span")[2];
      if (coeffSpan) coeffSpan.textContent = `${amCoeff} viên/m²`;
    }
    if (resultTilesDuong) {
      const coeffSpan = resultTilesDuong.querySelectorAll("span")[2];
      if (coeffSpan) coeffSpan.textContent = `${duongCoeff} viên/m²`;
    }
    if (resultDiem) {
      const coeffSpan = resultDiem.querySelectorAll("span")[2];
      if (coeffSpan) coeffSpan.textContent = `${diemCoeff} cặp/md`;
    }
  };
  const updateResults = () => {
    var _a2;
    let totalS = 0;
    let totalL = 0;
    const blocks = getAreaBlocks();
    blocks.forEach((block) => {
      var _a3, _b, _c, _d, _e;
      const select = block.querySelector("select");
      const inputs = Array.from(block.querySelectorAll("input")).filter(
        (i) => {
          var _a4;
          return ((_a4 = i.closest(".relative")) == null ? void 0 : _a4.parentElement.style.display) !== "none";
        }
      );
      const type = select.value || select.options[select.selectedIndex].text;
      let S = 0;
      let L = 0;
      if (type.includes("CHỮ NHẬT")) {
        const dai = parseFloat((_a3 = inputs[0]) == null ? void 0 : _a3.value) || 0;
        const rong = parseFloat((_b = inputs[1]) == null ? void 0 : _b.value) || 0;
        S = dai * rong;
        L = dai;
      } else if (type.includes("THANG")) {
        const dayLon = parseFloat((_c = inputs[0]) == null ? void 0 : _c.value) || 0;
        const dayBe = parseFloat((_d = inputs[1]) == null ? void 0 : _d.value) || 0;
        const cao = parseFloat((_e = inputs[2]) == null ? void 0 : _e.value) || 0;
        S = (dayLon + dayBe) * cao / 2;
        L = dayLon;
      }
      totalS += S;
      totalL += L;
    });
    let factor = 1;
    if (extraLossCheckbox && extraLossCheckbox.checked) {
      const checkedRadio = Array.from(lossRadios).find((r) => r.checked);
      if (checkedRadio) {
        const label = ((_a2 = checkedRadio.closest("label")) == null ? void 0 : _a2.textContent) || "";
        if (label.includes("15%")) factor = 1.15;
        else if (label.includes("20%")) factor = 1.2;
      }
    }
    const styleFactor = roofStyleSelect && roofStyleSelect.value !== "" ? parseFloat(roofStyleSelect.options[roofStyleSelect.selectedIndex].dataset.factor) || 1 : 0;
    factor *= styleFactor;
    updateCoeffLabels();
    const selectedTile = tileTypeSelect == null ? void 0 : tileTypeSelect.options[tileTypeSelect.selectedIndex];
    const amCoeff = selectedTile && selectedTile.value !== "" ? parseFloat(selectedTile.dataset.am) || 0 : 0;
    const duongCoeff = selectedTile && selectedTile.value !== "" ? parseFloat(selectedTile.dataset.duong) || 0 : 0;
    const diemCoeff = selectedTile && selectedTile.value !== "" ? parseFloat(selectedTile.dataset.diem) || 0 : 0;
    const ngoiAm = Math.ceil(totalS * amCoeff * factor);
    const ngoiDuong = Math.ceil(totalS * duongCoeff * factor);
    const diem = Math.ceil(totalL * diemCoeff * factor);
    if (resultTilesAm) {
      resultTilesAm.querySelectorAll("span")[1].textContent = `${format(totalS)} m²`;
      resultTilesAm.querySelectorAll("span")[3].textContent = `${format(ngoiAm)} viên`;
    }
    if (resultTilesDuong) {
      resultTilesDuong.querySelectorAll("span")[1].textContent = `${format(totalS)} m²`;
      resultTilesDuong.querySelectorAll("span")[3].textContent = `${format(ngoiDuong)} viên`;
    }
    if (resultDiem) {
      resultDiem.querySelectorAll("span")[1].textContent = `${format(totalL)} md`;
      resultDiem.querySelectorAll("span")[3].textContent = `${format(diem)} cặp`;
    }
  };
  const handleTypeChange = (block) => {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const select = block.querySelector("select");
    const type = select.value || select.options[select.selectedIndex].text;
    const inputGrid = block.querySelector(".grid-cols-12");
    const inputWrappers = Array.from(inputGrid.children);
    if (type.includes("CHỮ NHẬT")) {
      const label1 = (_a2 = inputWrappers[1]) == null ? void 0 : _a2.querySelector("label");
      if (label1)
        label1.innerHTML = `CHIỀU DÀI <span class="block text-[12px] font-normal italic normal-case text-secondary/70">Chiều tính diềm mái</span>`;
      (_b = inputWrappers[1]) == null ? void 0 : _b.classList.replace("md:col-span-3", "md:col-span-3");
      (_c = inputWrappers[1]) == null ? void 0 : _c.classList.replace("col-span-4", "col-span-6");
      const label2 = (_d = inputWrappers[2]) == null ? void 0 : _d.querySelector("label");
      if (label2) label2.innerHTML = `CHIỀU RỘNG <span class="block text-[12px] opacity-0">&nbsp;</span>`;
      (_e = inputWrappers[2]) == null ? void 0 : _e.classList.replace("md:col-span-3", "md:col-span-3");
      (_f = inputWrappers[2]) == null ? void 0 : _f.classList.replace("col-span-4", "col-span-6");
      if (inputWrappers[3]) inputWrappers[3].style.display = "none";
    } else if (type.includes("THANG")) {
      const label1 = (_g = inputWrappers[1]) == null ? void 0 : _g.querySelector("label");
      if (label1)
        label1.innerHTML = `ĐÁY LỚN <span class="block text-[12px] font-normal italic normal-case text-secondary/70">Chiều tính diềm mái</span>`;
      (_h = inputWrappers[1]) == null ? void 0 : _h.classList.replace("col-span-6", "col-span-4");
      const label2 = (_i = inputWrappers[2]) == null ? void 0 : _i.querySelector("label");
      if (label2) label2.innerHTML = `ĐÁY BÉ <span class="block text-[12px] opacity-0">&nbsp;</span>`;
      (_j = inputWrappers[2]) == null ? void 0 : _j.classList.replace("col-span-6", "col-span-4");
      if (inputWrappers[3]) {
        inputWrappers[3].style.removeProperty("display");
        (_k = inputWrappers[3]) == null ? void 0 : _k.classList.replace("col-span-6", "col-span-4");
        const label3 = inputWrappers[3].querySelector("label");
        if (label3) label3.innerHTML = `CHIỀU CAO <span class="block text-[12px] opacity-0">&nbsp;</span>`;
      }
    }
    [inputWrappers[1], inputWrappers[2], inputWrappers[3]].forEach((wrapper) => {
      const label = wrapper == null ? void 0 : wrapper.querySelector("label");
      if (!label) return;
      label.classList.remove("min-h-[42px]");
      label.classList.add("h-[44px]", "flex", "flex-col", "items-center", "justify-start");
    });
  };
  const renumberAreas = () => {
    getAreaBlocks().forEach((block, index) => {
      const titleSpan = getAreaTitle(block);
      if (titleSpan) titleSpan.textContent = `DIỆN TÍCH ${index + 1}`;
    });
  };
  const setupListeners = (block) => {
    block.querySelectorAll("input").forEach((input) => {
    });
    const select = block.querySelector("select");
    if (select) {
      select.addEventListener("change", () => handleTypeChange(block));
      handleTypeChange(block);
    }
    const removeBtn = block.querySelector("button.underline");
    if (removeBtn && removeBtn.textContent.includes("Loại bỏ")) {
      removeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        block.remove();
        renumberAreas();
        updateResults();
      });
    }
  };
  const addArea = () => {
    if (!masterTemplate) return;
    const newBlock = masterTemplate.cloneNode(true);
    newBlock.querySelectorAll("input").forEach((input) => input.value = "");
    let removeBtn = newBlock.querySelector("button.underline");
    if (!removeBtn || !removeBtn.textContent.includes("Loại bỏ")) {
      const titleSpan = newBlock.querySelector("span.tracking-widest");
      const titleWrapper = titleSpan == null ? void 0 : titleSpan.parentElement;
      if (titleWrapper) {
        titleWrapper.classList.add("flex", "flex-col");
        removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "text-[14px] text-secondary underline text-left font-bold";
        removeBtn.textContent = "Loại bỏ";
        titleWrapper.appendChild(removeBtn);
      }
    }
    const triggerDiv = addAreaBtn.parentElement;
    triggerDiv.before(newBlock);
    renumberAreas();
    setupListeners(newBlock);
  };
  getAreaBlocks().forEach(setupListeners);
  if (addAreaBtn) {
    addAreaBtn.addEventListener("click", (e) => {
      e.preventDefault();
      addArea();
    });
  }
  if (calculateBtn) {
    calculateBtn.addEventListener("click", (e) => {
      e.preventDefault();
      updateResults();
    });
  }
  if (extraLossCheckbox) {
    extraLossCheckbox.addEventListener("change", updateResults);
  }
  lossRadios.forEach((radio) => {
    radio.addEventListener("change", updateResults);
  });
  const checkButtonState = () => {
    if (!calculateBtn) return;
    const isStyleSelected = roofStyleSelect && roofStyleSelect.value !== "";
    const isTileSelected = tileTypeSelect && tileTypeSelect.value !== "";
    if (isStyleSelected && isTileSelected) {
      calculateBtn.disabled = false;
      calculateBtn.classList.remove("opacity-50", "cursor-not-allowed");
    } else {
      calculateBtn.disabled = true;
      calculateBtn.classList.add("opacity-50", "cursor-not-allowed");
    }
  };
  if (roofStyleSelect) {
    roofStyleSelect.addEventListener("change", () => {
      checkButtonState();
    });
  }
  if (tileTypeSelect) {
    tileTypeSelect.addEventListener("change", () => {
      updateCoeffLabels();
      checkButtonState();
    });
  }
  checkButtonState();
  updateResults();
};
const initQuantityCalculator = () => {
  var _a;
  const calculatorSection = document.querySelector("[data-quantity-calculator]");
  if (!calculatorSection) return;
  const areaBlocks = () => Array.from(calculatorSection.querySelectorAll("[data-area-block]"));
  const initialBlocks = areaBlocks();
  const masterTemplate = (_a = initialBlocks.find((block) => block.querySelector("[data-remove-area]")) || initialBlocks[initialBlocks.length - 1]) == null ? void 0 : _a.cloneNode(true);
  const addAreaBtn = calculatorSection.querySelector("[data-add-area]");
  const calculateBtn = calculatorSection.querySelector("[data-calculate-quantity]");
  const totalAreaOutput = calculatorSection.querySelector("[data-total-area-output]");
  const rateOutputs = Array.from(calculatorSection.querySelectorAll("[data-rate-output]"));
  const valueOutputs = Array.from(calculatorSection.querySelectorAll("[data-value-output]"));
  const extraLossCheckbox = calculatorSection.querySelector("#extra-loss-quantity");
  const lossRadios = Array.from(calculatorSection.querySelectorAll('input[name="loss-rate"]'));
  const numberFormatter = new Intl.NumberFormat("vi-VN");
  const formatNumber = (value) => numberFormatter.format(value);
  const parseNumericValue = (raw = "") => {
    const normalized = raw.replace(/\s/g, "").replace(/,/g, ".").replace(/[^\d.]/g, "");
    return parseFloat(normalized) || 0;
  };
  const getLossFactor = () => {
    var _a2;
    if (!extraLossCheckbox || !extraLossCheckbox.checked) return 1;
    const selectedRadio = lossRadios.find((radio) => radio.checked);
    if (!selectedRadio) return 1;
    const labelText = ((_a2 = selectedRadio.closest("label")) == null ? void 0 : _a2.textContent) || "";
    if (labelText.includes("10%")) return 1.1;
    if (labelText.includes("5%")) return 1.05;
    return 1;
  };
  const getBlockArea = (block) => {
    var _a2, _b;
    const inputs = Array.from(block.querySelectorAll('input[type="text"]'));
    const length = parseNumericValue(((_a2 = inputs[0]) == null ? void 0 : _a2.value) || "0");
    const width = parseNumericValue(((_b = inputs[1]) == null ? void 0 : _b.value) || "0");
    return length * width;
  };
  const getAreaTitle = (block) => Array.from(block.querySelectorAll("span")).find((span) => /DIỆN\s*TÍCH/i.test(span.textContent || ""));
  const renumberAreas = () => {
    areaBlocks().forEach((block, index) => {
      const title = getAreaTitle(block);
      if (title) title.textContent = `DIỆN TÍCH ${index + 1}`;
    });
  };
  const updateResults = () => {
    const rawArea = areaBlocks().reduce((sum, block) => sum + getBlockArea(block), 0);
    const roundedArea = Math.ceil(rawArea);
    const lossFactor = getLossFactor();
    if (totalAreaOutput) {
      totalAreaOutput.textContent = `${formatNumber(roundedArea)} m²`;
    }
    rateOutputs.forEach((rateEl, index) => {
      const rate = parseNumericValue(rateEl.textContent || "0");
      const quantity = Math.ceil(roundedArea * rate * lossFactor);
      if (valueOutputs[index]) {
        if (rate > 0) {
          valueOutputs[index].textContent = `${formatNumber(quantity)} viên`;
        } else {
          valueOutputs[index].textContent = "00 viên";
        }
      }
    });
  };
  const attachRemoveAreaListener = (block) => {
    const removeBtn = block.querySelector("[data-remove-area]");
    if (!removeBtn) return;
    removeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      block.remove();
      renumberAreas();
      updateResults();
    });
  };
  const addArea = () => {
    if (!masterTemplate) return;
    const newBlock = masterTemplate.cloneNode(true);
    newBlock.querySelectorAll('input[type="text"]').forEach((input) => {
      input.value = "";
    });
    const removeBtn = newBlock.querySelector("[data-remove-area]");
    if (!removeBtn) {
      const title = getAreaTitle(newBlock);
      const header = title ? title.parentElement : null;
      if (header) {
        header.classList.add("flex", "flex-col");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("data-remove-area", "");
        btn.className = "text-[14px] text-secondary underline text-start ml-4 font-medium opacity-80 hover:opacity-100 transition-opacity";
        btn.textContent = "Loại bỏ";
        header.appendChild(btn);
      }
    }
    const addAreaRow = addAreaBtn == null ? void 0 : addAreaBtn.parentElement;
    if (!addAreaRow) return;
    addAreaRow.before(newBlock);
    attachRemoveAreaListener(newBlock);
    renumberAreas();
  };
  areaBlocks().forEach(attachRemoveAreaListener);
  if (addAreaBtn) {
    addAreaBtn.addEventListener("click", (event) => {
      event.preventDefault();
      addArea();
    });
  }
  if (calculateBtn) {
    calculateBtn.addEventListener("click", (event) => {
      event.preventDefault();
      updateResults();
    });
  }
  if (extraLossCheckbox) {
    extraLossCheckbox.addEventListener("change", updateResults);
  }
  lossRadios.forEach((radio) => {
    radio.addEventListener("change", updateResults);
  });
  renumberAreas();
};
const init = () => {
  initCalculator();
  initQuantityCalculator();
  const valueImages = document.querySelectorAll(".value-image-item");
  const valueTitle = document.getElementById("value-title");
  const valueDescription = document.getElementById("value-description");
  const updateValueSection = (img) => {
    if (img.classList.contains("active")) return;
    valueImages.forEach((i) => i.classList.remove("active"));
    img.classList.add("active");
    valueTitle.style.opacity = "0";
    valueDescription.style.opacity = "0";
    valueTitle.style.transform = "translateY(10px)";
    valueDescription.style.transform = "translateY(10px)";
    setTimeout(() => {
      if (valueTitle) valueTitle.textContent = img.dataset.title;
      if (valueDescription) valueDescription.textContent = img.dataset.description;
      if (valueTitle) {
        valueTitle.style.opacity = "1";
        valueTitle.style.transform = "translateY(0)";
      }
      if (valueDescription) {
        valueDescription.style.opacity = "1";
        valueDescription.style.transform = "translateY(0)";
      }
    }, 300);
  };
  if (valueImages.length > 0 && valueTitle && valueDescription) {
    valueImages.forEach((img) => {
      img.addEventListener("mouseenter", () => {
        if (window.innerWidth >= 1024) updateValueSection(img);
      });
      img.addEventListener("click", () => {
        updateValueSection(img);
      });
    });
  }
};
export {
  init
};
