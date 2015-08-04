<?php

/**
 * Class SupsysticTables_Diagram_Module
 */
class SupsysticTables_Diagram_Module extends SupsysticTables_Core_BaseModule
{
    /**
     * {@inheritdoc}
     */
    public function onInit()
    {
        parent::onInit();

        $this->renderDiagramsSection();
    }

    /**
     * Renders the "Diagrams" tab.
     * @param \stdClass $table Current table
     */
    public function afterTabsRendered(stdClass $table)
    {
        $twig = $this->getEnvironment()->getTwig();
        $twig->display('@diagram/partials/tab.twig', array('table' => $table));
    }

    /**
     * Renders the "Diagrams" tab content.
     * @param \stdClass $table Current table
     */
    public function afterTabsContentRendered(stdClass $table)
    {
        $twig = $this->getEnvironment()->getTwig();
        $dispatcher = $this->getEnvironment()->getDispatcher();

        $twig->display(
            $dispatcher->apply(
                'diagram_tabs_content_template',
                array('@diagram/partials/tabContent.twig')
            ),
            $dispatcher->apply(
                'diagram_tabs_content_data',
                array(
                    array(
                        'table' => $table
                    )
                )
            )
        );
    }

    /**
     * Runs the callbacks after the table editor tabs rendered.
     */
    private function renderDiagramsSection()
    {
        $dispatcher = $this->getEnvironment()->getDispatcher();

        $dispatcher->on('tabs_rendered', array($this, 'afterTabsRendered'));
        $dispatcher->on(
            'tabs_content_rendered',
            array($this, 'afterTabsContentRendered')
        );
    }
}