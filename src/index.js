const { event } = require("jquery");
const $ = require("jquery");
require("jquery-ui");
//import "jquery-ui/themes/base/all.css";
require("jquery-ui/ui/widgets/draggable");
require("jquery-ui/ui/widgets/droppable");
require("jquery-ui/ui/widgets/slider");
require("./touch-punch");

$(document).ready(function () {
  var bsContainer = false;
  var bsStyles = {
    "max-width": "1230px",
    margin: "0 auto",
    padding: "0 30px",
  };
  var bsMobileStyles = {
    padding: "0 54px",
  };

  if (bsContainer) {
    $("body").css(bsStyles);
    if (screen.width < 930) {
      console.log("little screen");
      $("body").css(bsMobileStyles);
    }
  }

  $(".flip-card").attr("tabindex", "0");
  $(".flip-card").keypress(function (e) {
    e.preventDefault();
    $(this).children(".flip-card-inner").toggleClass("flipped");
  });

  var accordionButtons = $(".accordion-controls li a");

  $(".accordion-controls li a").on("click", function (e) {
    var $control = $(this);
    var accordionContent = $control.attr("aria-controls");
    checkOthers($control[0]);

    var isAriaExp = $control.attr("aria-expanded");
    var newAriaExp = isAriaExp == "false" ? "true" : "false";
    $control.attr("aria-expanded", newAriaExp);

    var isAriaHid = $("#" + accordionContent).attr("aria-hidden");
    if (isAriaHid == "true") {
      $("#" + accordionContent).attr("aria-hidden", "false");
      $("#" + accordionContent).toggleClass("max-h-full");
      $control.find("img.accordion__toggle").toggleClass("rotate-180");
      $("#" + accordionContent).css(
        "max-height",
        $("#" + accordionContent)[0].scrollHeight
      );
    } else {
      $("#" + accordionContent).attr("aria-hidden", "true");
      $("#" + accordionContent).toggleClass("max-h-full");
      $control.find("img.accordion__toggle").toggleClass("rotate-180");
      $("#" + accordionContent).css("max-height", 0);
    }
  });

  function checkOthers(elem) {
    for (var i = 0; i < accordionButtons.length; i++) {
      if (accordionButtons[i] != elem) {
        if ($(accordionButtons[i]).attr("aria-expanded") == "true") {
          $(accordionButtons[i]).attr("aria-expanded", "false");
          var content = $(accordionButtons[i]).attr("aria-controls");
          $("#" + content).attr("aria-hidden", "true");
          $("#" + content).toggleClass("h-auto");
          $(accordionButtons[i])
            .find("img.accordion__toggle")
            .toggleClass("rotate-180");
          $("#" + content).css("max-height", 0);
        }
      }
    }
  }

  $(".tabs li a:not(:first)").addClass("inactive");
  $(".tabs li a:first").addClass("bg-mp-teal text-white");

  $(".tabs__content>div:not(:first)").addClass("hidden");

  $(".tabs li a").on("click", function (e) {
    e.preventDefault();
    var t = $(this).attr("id");
    if ($(this).hasClass("inactive")) {
      //this is the start of our condition
      $(".tabs li a").removeClass("bg-mp-teal text-white").addClass("inactive");
      $(this).removeClass("inactive").addClass("bg-mp-teal text-white");

      $(".tabs__content>div").addClass("hidden");
      $(".tabs__content>#" + t).removeClass("hidden");
    }
  });

  /* Drag & Drop Activity */
  var wrongCount = 0;
  var rightCount = 0;
  var answerCount = $("#answer-count")[0];
  var totalExamples = $(".draggable span").length;
  var examplesRemaining = totalExamples;

  $("#answer-count")[0].innerHTML = totalExamples;

  $(".draggable span").draggable({
    revert: function (droppableContainer) {
      if (!droppableContainer) {
        if (wrongCount < 3) {
          wrongCount++;
        }
      }
      if (wrongCount === 3) {
        $(".feedback").removeClass("invisible");
      }
      return !droppableContainer; //returns the draggable to its original position
    },
  });

  $(".droppable").droppable({
    drop: function (event, ui) {
      ui.draggable.detach().appendTo($(this));
      ui.draggable
        .css("position", "initial")
        .css("display", "inline-block")
        .removeClass("bg-deep-teal")
        .addClass("bg-mp-blue");
      //rightCount++;
      //console.log($(this)[0].id);
      //console.log(ui.draggable[0].getAttribute("data-answer"));

      if ($(this)[0].id == ui.draggable[0].getAttribute("data-answer")) {
        rightCount++;
      } else {
        ui.draggable.addClass("wrong-answer");
      }

      $(".examples span:first-child").removeClass("hidden");
      examplesRemaining--;
      answerCount.innerHTML = examplesRemaining;

      if (examplesRemaining === 0) {
        $("#total-answers").addClass("hidden");
        $("#check-answers").removeClass("hidden");
      }
    },
  });

  $("#check-answers").on("click", function (e) {
    e.preventDefault();
    console.log(rightCount);
    $(this).addClass("hidden");
    $("#total-answers").removeClass("hidden");
    $("#total-answers")[0].innerHTML =
      "Correct Answers: " + rightCount + "/" + totalExamples;
    $("span.wrong-answer").css("background-color", "red");
  });

  //$("#sel").droppable({ accept: "span.sel" });
  //$("#classroom-management").droppable({ accept: "span.classroom-management" });

  /*    Food Allergens Participation Exercise     */
  $(".food-allergens__form").on("submit", function (e) {
    e.preventDefault();
    var answer = $(".food-allergens__form textarea").val();
    $(".food-allergens__form textarea, .food-allergens__form button ").addClass(
      "hidden"
    );
    $(".food-allergens__validation").removeClass("hidden");
    $(".food-allergens__answer").text(answer);
  });

  /* Slider Inputs */

  $(".slider").slider({
    value: 3,
    min: 1,
    max: 5,
    animate: true,
    classes: {
      "ui-slider-handle":
        "flex justify-center items-center bg-mp-teal text-white font-bold rounded-md",
      "ui-slider-horizontal": "bg-mp-azure ",
    },
    create: function () {
      var sliderHandle = $(this).children(".custom-handle");
      sliderHandle.text($(this).slider("value"));
    },
    slide: function (event, ui) {
      ui.handle.innerHTML = ui.value;
    },
  });
  $("#slider-feedback").submit(function (e) {
    e.preventDefault();
    $(this).children("button").hide();
    $("h3.validation").removeClass("invisible");
    $(".slider").each(function () {
      $(this).removeClass("bg-mp-azure").addClass("bg-gray-200");
      $(this)
        .children(".ui-slider-handle")
        .removeClass("bg-mp-teal text-white")
        .addClass("bg-gray-300 text-gray-200");
      $(this).slider("disable");
    });
  });
  $("#radio-button-feedback").submit(function (e) {
    e.preventDefault();
    $(this).children("button").hide();
    $("h3.validation").removeClass("invisible");
    $(this).find("input[type='radio']").attr("disabled", true);
    $(this).find("label").addClass("text-gray-400");
  });

  /***** Socratic Reflection Updates *****/
});
