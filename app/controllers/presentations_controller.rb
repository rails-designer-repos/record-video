class PresentationsController < ApplicationController
  def new
    @presentation = Presentation.new
  end

  def create
    presentation = Presentation.create(presentation_params)

    redirect_to edit_presentation_path(presentation)
  end

  def edit
    @presentation = Presentation.find(params[:id])
  end

  def update
    presentation = Presentation.find(params[:id])
    presentation.update(presentation_params)

    redirect_to edit_presentation_path(presentation)
  end

  private

  def presentation_params
    params.expect(presentation: [:title, :video])
  end
end
