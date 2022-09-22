const { event } = require("jquery");
const $ = require("jquery");
require("jquery-ui/ui/widgets/draggable");
require("jquery-ui/ui/widgets/droppable");

$(document).ready(function () {
  $(".flip-card").attr("tabindex", "0");
  $(".flip-card").keypress(function (e) {
    e.preventDefault();
    $(this).children(".flip-card-inner").toggleClass("flipped");
  });

  var accordionButtons = $(".accordion-controls li a");

  $(".accordion-controls li a").on("click", function (e) {
    $control = $(this);
    accordionContent = $control.attr("aria-controls");
    checkOthers($control[0]);

    isAriaExp = $control.attr("aria-expanded");
    newAriaExp = isAriaExp == "false" ? "true" : "false";
    $control.attr("aria-expanded", newAriaExp);

    isAriaHid = $("#" + accordionContent).attr("aria-hidden");
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
          content = $(accordionButtons[i]).attr("aria-controls");
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

  $(".tabs li a").on("click", function () {
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
        .addClass("bg-light-teal");
      rightCount++;

      if (rightCount == 11) {
        console.log("run it");
        $(".examples").addClass("hidden");
        $(".feedback")
          .removeClass("invisible text-xl text-red-500")
          .addClass("text-deep-teal text-2xl")
          .text(
            "Nice job! You have correctly identified the medication with the route of administration!"
          );
      }
    },
  });
  $("#oral").droppable({ accept: "span.oral" });
  $("#topical").droppable({ accept: "span.topical" });
  $("#inhalant").droppable({ accept: "span.inhalant" });
  $("#injectable").droppable({
    accept: "span.injectable",
  });

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
});
